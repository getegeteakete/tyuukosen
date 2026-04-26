'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? '送信に失敗しました');
      }
      setDone(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Check className="mx-auto text-emerald-500 mb-3" size={36} />
        <h1 className="font-display text-2xl font-bold text-ocean-900">送信完了</h1>
        <p className="text-sm text-ocean-700 mt-3">お問い合わせありがとうございました。担当者より2営業日以内にご返信いたします。</p>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-md border border-ocean-200 outline-none focus:border-coral-400 text-sm bg-white';

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-3">お問い合わせ</h1>
      <p className="text-sm text-ocean-700 mb-8">
        サービスについてのご質問・ご要望は下記フォームからお送りください。
      </p>
      <form onSubmit={submit} className="card-soft p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-ocean-800">お名前</label>
          <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={'mt-1.5 ' + inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">メールアドレス</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={'mt-1.5 ' + inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">件名</label>
          <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className={'mt-1.5 ' + inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">お問い合わせ内容</label>
          <textarea required rows={6} value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} className={'mt-1.5 ' + inputCls + ' resize-y'} />
        </div>
        {err && <p className="text-sm text-coral-500">{err}</p>}
        <button type="submit" disabled={busy} className="w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="animate-spin" size={16} />}
          送信する
        </button>
      </form>
    </div>
  );
}
