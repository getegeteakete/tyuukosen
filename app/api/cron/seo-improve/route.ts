import { NextResponse } from 'next/server';
import { runSeoImproverAgent } from '@/lib/ai/agents/seo-improver';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const r = await runSeoImproverAgent();
  return NextResponse.json(r);
}
