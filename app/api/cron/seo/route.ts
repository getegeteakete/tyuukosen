/**
 * Cron: 毎日 03:00 JST
 * まだAI記事のない公開済み船に対してSEO記事を生成。
 */
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { runArticleWriterAgent } from '@/lib/ai/agents/article-writer';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: Request) {
  // Vercel Cron認証
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: boats } = await supabase
    .from('boats')
    .select('id')
    .eq('status', 'published')
    .is('ai_generated_article', null)
    .limit(5);

  if (!boats || boats.length === 0) return NextResponse.json({ ok: true, generated: 0 });

  const results = [];
  for (const b of boats) {
    try {
      const r = await runArticleWriterAgent({ boatId: b.id });
      results.push({ id: b.id, ok: r.ok });
    } catch (e: any) {
      results.push({ id: b.id, ok: false, error: String(e?.message ?? e) });
    }
  }
  return NextResponse.json({ ok: true, generated: results.length, results });
}
