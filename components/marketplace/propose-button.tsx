'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, Loader2 } from 'lucide-react';

export function ProposeButton({ wantedId, buyerId }: { wantedId: string; buyerId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function startChat() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth/login?redirect=/wanted/${wantedId}`);
      return;
    }
    if (user.id === buyerId) {
      alert('ご自身の投稿には提案できません');
      setBusy(false);
      return;
    }

    // chat_rooms 作成
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('wanted_id', wantedId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', user.id)
      .maybeSingle();

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    const { data: room, error } = await supabase
      .from('chat_rooms')
      .insert({ wanted_id: wantedId, buyer_id: buyerId, seller_id: user.id })
      .select('id')
      .single();
    if (error) { alert(error.message); setBusy(false); return; }
    router.push(`/chat/${room.id}`);
  }

  return (
    <button
      onClick={startChat}
      disabled={busy}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50"
    >
      {busy ? <Loader2 className="animate-spin" size={14} /> : <MessageCircle size={14} />}
      提案する
    </button>
  );
}
