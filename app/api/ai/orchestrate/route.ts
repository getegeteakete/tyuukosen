import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { orchestrate } from '@/lib/ai/orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  try {
    const result = await orchestrate({
      userId: user.id,
      message: body.message,
      context: body.context,
      history: body.history,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'orchestration_failed', detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
