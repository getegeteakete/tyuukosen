'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const sp = useSearchParams();
  const redirect = sp.get('redirect') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ocean-900 text-center">
        ログイン / 新規登録
      </h1>
      <p className="text-sm text-ocean-700 mt-2 text-center">メールリンクで安全にログインします。</p>

      {sent ? (
        <div className="mt-8 card-soft p-6 text-center">
          <div className="text-3xl mb-2">📩</div>
          <p className="text-sm text-ocean-900">{email} 宛にログインリンクを送りました。</p>
          <p className="text-xs text-ocean-700 mt-2">届かない場合は迷惑メールをご確認ください。</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 card-soft p-6 space-y-4">
          <div>
            <label className="text-xs text-ocean-700">メールアドレス</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-md border border-ocean-200 outline-none focus:border-coral-400 text-sm"
              placeholder="you@example.com"
            />
          </div>
          {err && <p className="text-xs text-coral-500">{err}</p>}
          <button
            type="submit" disabled={busy}
            className="w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="animate-spin" size={16} />}
            ログインリンクを送る
          </button>
          <p className="text-[11px] text-ocean-700 text-center">
            登録 = <Link href="/legal/terms" className="underline">利用規約</Link>に同意
          </p>
        </form>
      )}
    </div>
  );
}
