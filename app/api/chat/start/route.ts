import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { boat_id, seller_id } = await req.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.id === seller_id) {
    return NextResponse.json({ error: 'cannot_chat_self' }, { status: 400 });
  }

  // 既存ルームを再利用
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('boat_id', boat_id)
    .eq('buyer_id', user.id)
    .eq('seller_id', seller_id)
    .maybeSingle();

  if (existing) return NextResponse.json({ room_id: existing.id });

  const { data: room, error } = await supabase
    .from('chat_rooms')
    .insert({ boat_id, buyer_id: user.id, seller_id })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 出品者の inquiry_count を加算（失敗しても続行）
  try { await supabase.rpc('increment_inquiry', { boat_id_in: boat_id }); } catch {}

  return NextResponse.json({ room_id: room.id });
}
