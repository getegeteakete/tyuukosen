/**
 * SEO Improver Agent — アクセス分析からの自動改善
 *
 * 直近のアクセスデータを見て、
 * - 直帰率が高い船ページの紹介文をAIで書き直し
 * - 滞在時間が短いページにCTAを追加
 * - 検索流入キーワードからメタディスクリプションを再生成
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/service';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runSeoImproverAgent() {
  const supabase = createServiceClient();

  // 直近7日のアクセスを集計
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: stats } = await supabase
    .from('page_analytics')
    .select('boat_id, bounce, duration_sec')
    .gte('visited_at', sevenDaysAgo)
    .not('boat_id', 'is', null);

  if (!stats || stats.length === 0) return { ok: true, improved: 0 };

  // 船ごとに集計
  const byBoat: Record<
    string,
    { views: number; bounces: number; totalDuration: number }
  > = {};
  for (const s of stats) {
    const id = s.boat_id as string;
    if (!byBoat[id]) byBoat[id] = { views: 0, bounces: 0, totalDuration: 0 };
    byBoat[id].views += 1;
    if (s.bounce) byBoat[id].bounces += 1;
    byBoat[id].totalDuration += s.duration_sec ?? 0;
  }

  // 改善候補：閲覧10以上 & 直帰率70%以上 OR 平均滞在20秒未満
  const candidates = Object.entries(byBoat)
    .filter(([, v]) => v.views >= 10 && (v.bounces / v.views > 0.7 || v.totalDuration / v.views < 20))
    .slice(0, 5);

  let improved = 0;
  for (const [boatId, metrics] of candidates) {
    const { data: boat } = await supabase
      .from('boats')
      .select('*')
      .eq('id', boatId)
      .single();
    if (!boat) continue;

    const prompt = `次の中古船ページの直帰率が高く、紹介文を改善する必要があります。

現在の紹介文:
${boat.ai_generated_article ?? boat.description ?? '（なし）'}

メトリクス:
- 閲覧数: ${metrics.views}
- 直帰率: ${((metrics.bounces / metrics.views) * 100).toFixed(0)}%
- 平均滞在: ${(metrics.totalDuration / metrics.views).toFixed(0)}秒

【改善方針】
- 冒頭3行で具体的な購入後の体験を描く（釣り、家族でクルーズなど）
- 数字とスペックを箇条書きで分かりやすく
- 「内見予約」「無料見積」などCTAをセクション末尾に
- 1200字前後

改善版を本文のみ（マークダウン可）で返してください。前置き不要。`;

    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });
    const newContent = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: string; text: string }).text)
      .join('\n');

    // 履歴と最新版を保存
    const { data: existing } = await supabase
      .from('seo_articles')
      .select('id, content_md, ai_improvement_history')
      .eq('boat_id', boatId)
      .single();

    const history = (existing?.ai_improvement_history as any[]) ?? [];
    history.push({
      improved_at: new Date().toISOString(),
      previous_excerpt: (existing?.content_md ?? '').slice(0, 200),
      reason: `bounce_rate=${((metrics.bounces / metrics.views) * 100).toFixed(0)}%`,
    });

    if (existing) {
      await supabase
        .from('seo_articles')
        .update({ content_md: newContent, ai_improvement_history: history })
        .eq('id', existing.id);
    }
    await supabase
      .from('boats')
      .update({ ai_generated_article: newContent })
      .eq('id', boatId);

    await supabase.from('ai_jobs').insert({
      agent: 'seo_improver',
      task: 'rewrite_low_engagement',
      payload: { boat_id: boatId, metrics },
      status: 'done',
      finished_at: new Date().toISOString(),
    });

    improved += 1;
  }

  return { ok: true, improved };
}
