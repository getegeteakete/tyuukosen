'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Video, Loader2 } from 'lucide-react';

export function ContactCta({ boatId, sellerId }: { boatId: string; sellerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function startChat() {
    setLoading('chat');
    const res = await fetch('/api/chat/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ boat_id: boatId, seller_id: sellerId }),
    });
    if (res.status === 401) {
      router.push(`/auth/login?redirect=/boats/${boatId}`);
      return;
    }
    const json = await res.json();
    if (json.room_id) router.push(`/chat/${json.room_id}`);
    setLoading(null);
  }

  function bookViewing() {
    router.push(`/dashboard/viewings/new?boat=${boatId}`);
  }

  return (
    <div className="mt-5 grid gap-2">
      <button
        onClick={startChat}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {loading === 'chat' ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
        匿名チャットで質問する
      </button>
      <button
        onClick={bookViewing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-ocean-50 hover:bg-ocean-100 text-ocean-900 text-sm font-medium"
      >
        <Video size={16} />
        ZOOM見学を予約
      </button>
    </div>
  );
}
