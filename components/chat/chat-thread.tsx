'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  is_system: boolean;
  created_at: string;
}

export function ChatThread({
  roomId, myUserId, myHandle, otherHandle, initialMessages,
}: {
  roomId: string;
  myUserId: string;
  myHandle: string;
  otherHandle: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((cur) => (cur.find((x) => x.id === m.id) ? cur : [...cur, m]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: myUserId,
      body: input,
    });
    await supabase
      .from('chat_rooms')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', roomId);
    if (!error) setInput('');
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-sand-50">
        {messages.length === 0 && (
          <div className="text-center text-xs text-ocean-700 py-8">
            最初のメッセージを送ってみましょう。
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === myUserId;
          if (m.is_system) {
            return (
              <div key={m.id} className="text-center text-[11px] text-ocean-700 italic">
                — {m.body} —
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${mine ? '' : 'flex flex-col'}`}>
                {!mine && <p className="text-[10px] text-ocean-700 mb-0.5 ml-2">{otherHandle}</p>}
                <div className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                  mine ? 'bg-coral-500 text-white rounded-br-sm' : 'bg-white border border-ocean-100 text-ocean-900 rounded-bl-sm'
                }`}>
                  {m.body}
                </div>
                <p className={`text-[10px] text-ocean-700 mt-0.5 ${mine ? 'text-right mr-2' : 'ml-2'}`}>
                  {new Date(m.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="border-t border-ocean-100 p-3 flex gap-2 items-end bg-white">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(e as any);
            }
          }}
          placeholder="メッセージを入力（Shift+Enterで改行）"
          className="flex-1 resize-none text-sm rounded-xl border border-ocean-200 px-3 py-2 outline-none focus:border-coral-400 max-h-32"
        />
        <button
          type="submit" disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 disabled:opacity-40 text-white flex items-center justify-center"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
