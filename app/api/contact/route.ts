import { NextResponse } from 'next/server';
import { createServiceClient, isServiceConfigured } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.email || !body.subject || !body.body) {
    return NextResponse.json({ error: '必須項目が未入力です' }, { status: 400 });
  }

  if (!isServiceConfigured()) {
    return NextResponse.json({ error: 'システム未設定' }, { status: 503 });
  }

  // sales_email_logsテーブルを汎用ログとして流用
  const svc = createServiceClient();
  await svc.from('sales_email_logs').insert({
    subject: `[お問い合わせ] ${body.subject}`,
    body: `From: ${body.name} <${body.email}>\n\n${body.body}`,
  });

  return NextResponse.json({ ok: true });
}
