import { NextResponse } from 'next/server';
import { runSalesEmailerAgent } from '@/lib/ai/agents/sales-emailer';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const r = await runSalesEmailerAgent({ batchSize: 20 });
  return NextResponse.json(r);
}
