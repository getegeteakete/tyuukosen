/**
 * Article Writer Agent — SEO記事の自動生成
 *
 * 船データから:
 * - SEO最適化された詳細紹介文（船ページに表示）
 * - サイト内ブログ記事（/articles 配下）
 * - メタディスクリプション・キーワード
 * を生成する。
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/service';
import { slugify } from '@/lib/utils';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runArticleWriterAgent(input: {
  boatId: string;
  parentJobId?: string;
}) {
  const supabase = createServiceClient();

  const { data: boat } = await supabase
    .from('boats')
    .select('*')
    .eq('id', input.boatId)
    .single();
  if (!boat) return { ok: false, reason: 'boat_not_found' };

  const prompt = `次の中古船情報から、購入検討者の心を掴むSEO記事を日本語で作成してください。

【船情報】
タイトル: ${boat.title}
メーカー: ${boat.brand ?? '不明'}
モデル: ${boat.model ?? '不明'}
年式: ${boat.year ?? '不明'}
全長: ${boat.length_ft ?? '不明'}フィート
船体材質: ${boat.hull_material ?? '不明'}
エンジン: ${boat.engine_type ?? '不明'}（${boat.engine_hours ?? '?'}時間）
所在地: ${boat.location_pref ?? ''}${boat.location_city ?? ''}
価格: ${boat.price?.toLocaleString()}円
装備: ${(boat.features ?? []).join('、')}
備考: ${boat.description ?? ''}

【要件】
1. 1000〜1500字
2. 見出しh2を3〜4個
3. 「中古船 ${boat.brand ?? ''}」「${boat.location_pref ?? ''} 中古船」などの自然なキーワード配置
4. 購入後の楽しいシーン（釣り・クルージング）も具体的に描写
5. 信頼感のある語り口

JSON形式で返答:
{"title":"...", "content_md":"...", "meta_description":"120字以内", "keywords":["...","..."]}`;

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = resp.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('\n');

  let article: { title: string; content_md: string; meta_description: string; keywords: string[] };
  try {
    article = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { ok: false, reason: 'parse_error', raw: text };
  }

  // 1. 船自体に紹介文を保存
  await supabase
    .from('boats')
    .update({
      ai_generated_article: article.content_md,
      ai_seo_keywords: article.keywords,
    })
    .eq('id', input.boatId);

  // 2. seo_articlesに追加（独立した記事ページ用）
  const slug = slugify(`${boat.brand ?? 'boat'}-${boat.model ?? boat.id.slice(0, 8)}`);
  await supabase.from('seo_articles').insert({
    boat_id: input.boatId,
    slug,
    title: article.title,
    content_md: article.content_md,
    meta_description: article.meta_description,
    keywords: article.keywords,
  });

  await supabase.from('ai_jobs').insert({
    agent: 'article_writer',
    task: 'generate_seo_article',
    payload: { boat_id: input.boatId },
    status: 'done',
    result: { slug, keywords: article.keywords },
    parent_job_id: input.parentJobId,
    finished_at: new Date().toISOString(),
  });

  return { ok: true, slug, ...article };
}
