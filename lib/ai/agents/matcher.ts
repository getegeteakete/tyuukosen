/**
 * Matcher Agent — 買い手↔出品船のマッチング
 *
 * 1. 条件で絞り込み（SQL）
 * 2. 上位候補にAIで詳細スコアリング（0-100点）し、推薦理由も生成
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/service';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Criteria {
  budget_min?: number;
  budget_max?: number;
  size_min_ft?: number;
  size_max_ft?: number;
  preferred_pref?: string[];
  preferred_period?: string;
  use_case?: string;     // 釣り・クルージング・観光
}

export async function runMatcherAgent(input: {
  userId: string;
  criteria: Criteria;
  parentJobId?: string;
}) {
  const supabase = createServiceClient();

  // 1) 一次絞り込み
  let q = supabase
    .from('boats')
    .select('id,title,brand,model,year,length_ft,price,location_pref,cover_image_url,description,features')
    .eq('status', 'published')
    .limit(20);

  if (input.criteria.budget_min) q = q.gte('price', input.criteria.budget_min);
  if (input.criteria.budget_max) q = q.lte('price', input.criteria.budget_max);
  if (input.criteria.size_min_ft) q = q.gte('length_ft', input.criteria.size_min_ft);
  if (input.criteria.size_max_ft) q = q.lte('length_ft', input.criteria.size_max_ft);
  if (input.criteria.preferred_pref?.length) {
    q = q.in('location_pref', input.criteria.preferred_pref);
  }

  const { data: candidates } = await q;
  if (!candidates || candidates.length === 0) {
    return { ok: true, results: [], message: '条件に合う船が見つかりませんでした。条件を緩めてください。' };
  }

  // 2) 上位5件にAIでスコアリング（コスト抑制）
  const top = candidates.slice(0, 5);
  const prompt = `あなたは中古船売買のコンシェルジュです。
買い手の希望:
${JSON.stringify(input.criteria, null, 2)}

候補船:
${JSON.stringify(top, null, 2)}

各候補について「マッチ度（0-100）」と「3行以内の推薦理由」をJSONで返してください。
形式: [{"id":"...","score":85,"reason":"..."}]`;

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = resp.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: string; text: string }).text)
    .join('\n');

  let scored: Array<{ id: string; score: number; reason: string }> = [];
  try {
    scored = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    scored = top.map((c) => ({ id: c.id, score: 50, reason: '一次絞り込みで合致' }));
  }

  const results = scored
    .map((s) => {
      const c = top.find((x) => x.id === s.id);
      return c ? { ...c, score: s.score, ai_reason: s.reason } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b!.score - a!.score));

  await supabase.from('ai_jobs').insert({
    agent: 'matcher',
    task: 'score_candidates',
    payload: input.criteria,
    status: 'done',
    result: { count: results.length },
    parent_job_id: input.parentJobId,
    finished_at: new Date().toISOString(),
  });

  return { ok: true, results };
}
