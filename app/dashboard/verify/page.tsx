'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, Shield, Check } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('ログインしてください'); setBusy(false); return; }

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('id-docs').upload(path, file);
    if (upErr) { setErr(upErr.message); setBusy(false); return; }

    // private bucket なので URL は path を保存
    await supabase
      .from('profiles')
      .update({
        id_doc_url: path,
        id_verified: false,        // 管理者チェック後に true
      })
      .eq('user_id', user.id);

    setDone(true); setBusy(false);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="font-display text-xl font-bold text-ocean-900">身分証を受領しました</h1>
        <p className="text-sm text-ocean-700 mt-2">
          管理者の確認後、認証バッジが表示されます（通常1〜2営業日）。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center">
        <Shield className="mx-auto text-ocean-500 mb-3" size={36} />
        <h1 className="font-display text-2xl font-bold text-ocean-900">身分証の確認</h1>
        <p className="text-sm text-ocean-700 mt-2">
          安全な取引のため、運転免許証・マイナンバーカード等の写真をアップロードしてください。<br />
          画像は暗号化保存され、管理者のみ閲覧します。
        </p>
      </div>

      <form onSubmit={submit} className="card-soft p-6 mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ocean-800">身分証の画像</span>
          <div className="mt-2 border-2 border-dashed border-ocean-200 rounded-md p-6 text-center cursor-pointer hover:border-coral-300">
            {file ? (
              <p className="text-sm text-ocean-900 flex items-center justify-center gap-2">
                <Check size={14} className="text-emerald-500" /> {file.name}
              </p>
            ) : (
              <p className="text-xs text-ocean-700 flex items-center justify-center gap-2">
                <Upload size={14} /> クリックして画像を選択
              </p>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </label>
        {err && <p className="text-sm text-coral-500">{err}</p>}
        <button type="submit" disabled={busy || !file} className="w-full py-3 rounded-full bg-coral-500 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="animate-spin" size={14} />}
          送信する
        </button>
      </form>

      <p className="text-[11px] text-ocean-700 mt-4 text-center">
        画像は本人確認のみに使用し、第三者には開示しません。
      </p>
    </div>
  );
}
