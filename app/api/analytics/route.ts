import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const svc = createServiceClient();
  await svc.from('page_analytics').insert({
    path: body.path,
    boat_id: body.boat_id ?? null,
    referrer: body.referrer ?? null,
    user_agent: body.ua ?? null,
    session_id: body.sid ?? null,
    bounce: body.bounce ?? false,
    duration_sec: body.duration_sec ?? null,
  });

  return NextResponse.json({ ok: true });
}
