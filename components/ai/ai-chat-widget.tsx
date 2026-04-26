'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  followUp?: string[];
  data?: any;
}

const INITIAL: Msg = {
  role: 'assistant',
  content:
    'はじめまして、中古船マーケットのAIアシスタントです。\n「船を出品したい」「予算500万でクルーザーを探している」など、お気軽にどうぞ。',
  followUp: ['船を出品したい', '中古船を探したい', '補助金について'],
};

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, loading]);

  // 認証ページではFAB非表示
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/sign/')) return null;

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/orchestrate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { page: pathname },
          history: next.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.status === 401) {
        setMsgs((m) => [
          ...m,
          {
            role: 'assistant',
            content: 'AIアシスタントを使うには無料会員登録が必要です。登録は1分で完了します。',
            followUp: ['会員登録する'],
          },
        ]);
      } else {
        const json = await res.json();
        setMsgs((m) => [
          ...m,
          {
            role: 'assistant',
            content: json.reply ?? '（応答なし）',
            followUp: json.followUp,
            data: json.data,
          },
        ]);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: 'assistant', content: 'すみません、通信エラーが起きました。少し時間をおいて再度お試しください。' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="AIアシスタントを開く"
          className="fixed z-40 bottom-5 right-5 w-14 h-14 rounded-full bg-coral-500 hover:bg-coral-600 text-white shadow-lg fab-pulse flex items-center justify-center"
        >
          <Sparkles size={22} />
        </button>
      )}

      {open && (
        <div className="fixed z-40 bottom-5 right-5 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] bg-white rounded-2xl shadow-2xl border border-ocean-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ocean-900 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-coral-300" />
              <div>
                <p className="text-sm font-medium">AIアシスタント</p>
                <p className="text-[10px] opacity-70">登録・検索・契約までサポート</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              aria-label="閉じる"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-sand-50">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-coral-500 text-white rounded-br-sm'
                      : 'bg-white text-ocean-900 border border-ocean-100 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                  {/* マッチング結果カード（コンパクト表示） */}
                  {m.data?.results && Array.isArray(m.data.results) && (
                    <div className="mt-2 space-y-1.5">
                      {m.data.results.slice(0, 3).map((r: any) => (
                        <Link
                          key={r.id}
                          href={`/boats/${r.id}`}
                          className="block bg-ocean-50 rounded-lg p-2 border border-ocean-100 hover:border-coral-300"
                        >
                          <p className="text-xs font-medium text-ocean-900 truncate">{r.title}</p>
                          <p className="text-[10px] text-coral-500 mt-0.5">
                            ¥{r.price?.toLocaleString()} ・ マッチ度 {r.score}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                  {/* 出品ドラフト作成成功 */}
                  {m.data?.boat_id && (
                    <Link
                      href={`/dashboard/boats/${m.data.boat_id}/edit`}
                      className="mt-2 inline-block text-xs underline text-coral-500"
                    >
                      → 下書きを開いて続きを編集
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3.5 py-2.5 bg-white border border-ocean-100">
                  <Loader2 className="animate-spin text-ocean-500" size={16} />
                </div>
              </div>
            )}
            {/* Follow-up suggestions */}
            {!loading && msgs.length > 0 && msgs[msgs.length - 1].followUp && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {msgs[msgs.length - 1].followUp!.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1 rounded-full bg-white border border-ocean-200 text-ocean-800 hover:border-coral-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-ocean-100 p-3 flex gap-2 items-end bg-white"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="メッセージを入力（Shift+Enterで改行）"
              className="flex-1 resize-none text-sm rounded-xl border border-ocean-200 px-3 py-2 outline-none focus:border-coral-400 max-h-32"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 disabled:opacity-40 text-white flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
