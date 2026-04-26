/**
 * SNS Poster Agent — 自動SNS投稿
 *
 * cronで定期実行され、まだ投稿していない/再投稿が必要な船を選んで
 * Twitter・Facebookに告知する。
 *
 * 実装注: Twitter API v2のOAuth1.0aフロー、Meta Graph APIなど
 *        本実装は概念実装。本番ではバウンス・エラー処理・レート制限を強化。
 */
import { createServiceClient } from '@/lib/supabase/service';
import { getAnthropic } from '@/lib/ai/clients';


interface PostOptions {
  limit?: number;       // 1回のCronで処理する件数
  platforms?: Array<'twitter' | 'facebook'>;
}

export async function runSnsPosterAgent(opts: PostOptions = {}) {
  const supabase = createServiceClient();
  const limit = opts.limit ?? 3;
  const platforms = opts.platforms ?? ['twitter', 'facebook'];

  // 未投稿 or 7日以上前に最後投稿の船
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: boats } = await supabase
    .from('boats')
    .select('id,title,brand,price,location_pref,cover_image_url')
    .eq('status', 'published')
    .or(`sns_posted_at.is.null,sns_posted_at.lt.${sevenDaysAgo}`)
    .order('sns_post_count', { ascending: true })
    .limit(limit);

  if (!boats || boats.length === 0) return { ok: true, posted: 0 };

  const results: any[] = [];

  for (const boat of boats) {
    // 投稿文をAI生成
    const resp = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `次の中古船をTwitter（140字以内）とFacebook（300字程度）でそれぞれ告知する文を日本語で作成。
ハッシュタグも含める。船URL: ${process.env.NEXT_PUBLIC_SITE_URL}/boats/${boat.id}

船: ${boat.title}（${boat.brand}）
価格: ${boat.price?.toLocaleString()}円
場所: ${boat.location_pref}

JSON形式: {"twitter":"...","facebook":"..."}`,
        },
      ],
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: string; text: string }).text)
      .join('\n');

    let copy: { twitter: string; facebook: string };
    try {
      copy = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      continue;
    }

    // 各プラットフォームに投稿
    for (const platform of platforms) {
      const content = platform === 'twitter' ? copy.twitter : copy.facebook;
      const externalId = await postToPlatform(platform, content, boat.cover_image_url);

      await supabase.from('sns_posts').insert({
        boat_id: boat.id,
        platform,
        content,
        media_url: boat.cover_image_url,
        external_id: externalId,
      });

      results.push({ boat_id: boat.id, platform, ok: !!externalId });
    }

    // boat側を更新
    await supabase
      .from('boats')
      .update({
        sns_posted_at: new Date().toISOString(),
        sns_post_count: (boat as any).sns_post_count ? (boat as any).sns_post_count + 1 : 1,
      })
      .eq('id', boat.id);
  }

  return { ok: true, posted: results.length, results };
}

/**
 * 実際の投稿実装はプレースホルダー。
 * Twitter v2: POST /2/tweets, Facebook: POST /{page-id}/feed
 */
async function postToPlatform(
  platform: 'twitter' | 'facebook',
  content: string,
  mediaUrl?: string | null
): Promise<string | null> {
  // TODO: 本番実装でTwitter API / Meta Graph APIを叩く
  // 現状はログのみ
  console.log(`[SNS ${platform}]`, content.slice(0, 100), mediaUrl);
  return `mock_${platform}_${Date.now()}`;
}
