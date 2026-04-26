import { NextResponse } from 'next/server';
import { runSnsPosterAgent } from '@/lib/ai/agents/sns-poster';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const r = await runSnsPosterAgent({ limit: 3, platforms: ['twitter', 'facebook'] });
  return NextResponse.json(r);
}
