import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { token, contractId, signature } = await req.json();
  if (!token || !contractId || !signature) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: c } = await svc
    .from('contracts')
    .select('id,status,sign_token')
    .eq('id', contractId)
    .single();

  if (!c || c.sign_token !== token) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 403 });
  }
  if (c.status !== 'pending') {
    return NextResponse.json({ error: 'already_signed' }, { status: 409 });
  }

  const sigDataUrl = signature.startsWith('data:')
    ? signature
    : `data:image/png;base64,${signature}`;

  const { error } = await svc
    .from('contracts')
    .update({
      buyer_signature: sigDataUrl,
      buyer_signed_at: new Date().toISOString(),
      status: 'signed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contractId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
