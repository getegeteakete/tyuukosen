'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const PREFS = ['北海道','東京都','神奈川県','静岡県','愛知県','大阪府','広島県','福岡県','長崎県','沖縄県'];

export function WantedForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [sizeMin, setSizeMin] = useState<number | undefined>();
  const [sizeMax, setSizeMax] = useState<number | undefined>();
  const [period, setPeriod] = useState('');
  const [prefs, setPrefs] = useState<string[]>([]);

  function togglePref(p: string) {
    setPrefs((s) => (s.includes(p) ? s.filter(x => x !== p) : [...s, p]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const supabase = createClient();
    const { error } = await supabase.from('wanted_posts').insert({
      buyer_id: userId,
      title, body: body || null,
      budget_min: budgetMin ?? null, budget_max: budgetMax ?? null,
      size_min_ft: sizeMin ?? null, size_max_ft: sizeMax ?? null,
      preferred_period: period || null,
      preferred_pref: prefs.length > 0 ? prefs : null,
      status: 'open',
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push('/wanted');
    router.refresh();
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-md border border-ocean-200 outline-none focus:border-coral-400 text-sm';

  return (
    <form onSubmit={submit} className="mt-8 space-y-5 card-soft p-6">
      <div>
        <label className="text-xs font-medium text-ocean-800">タイトル<span className="text-coral-500">*</span></label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={'mt-1.5 ' + inputCls} placeholder="例: 25ftクラスのファミリー向けクルーザー希望" />
      </div>
      <div>
        <label className="text-xs font-medium text-ocean-800">詳細</label>
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={'mt-1.5 ' + inputCls + ' resize-y'} placeholder="使用目的や希望装備など" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ocean-800">予算（下限）</label>
          <input type="number" value={budgetMin ?? ''} onChange={(e) => setBudgetMin(Number(e.target.value) || undefined)} className={'mt-1.5 ' + inputCls} placeholder="円" />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">予算（上限）</label>
          <input type="number" value={budgetMax ?? ''} onChange={(e) => setBudgetMax(Number(e.target.value) || undefined)} className={'mt-1.5 ' + inputCls} placeholder="円" />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">サイズ（下限ft）</label>
          <input type="number" step="0.1" value={sizeMin ?? ''} onChange={(e) => setSizeMin(Number(e.target.value) || undefined)} className={'mt-1.5 ' + inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">サイズ（上限ft）</label>
          <input type="number" step="0.1" value={sizeMax ?? ''} onChange={(e) => setSizeMax(Number(e.target.value) || undefined)} className={'mt-1.5 ' + inputCls} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-ocean-800">希望時期</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={'mt-1.5 ' + inputCls}>
          <option value="">指定なし</option>
          <option>1ヶ月以内</option>
          <option>3ヶ月以内</option>
          <option>半年以内</option>
          <option>1年以内</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-ocean-800">希望地域（複数可）</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {PREFS.map((p) => (
            <button type="button" key={p} onClick={() => togglePref(p)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                prefs.includes(p) ? 'bg-coral-500 text-white border-coral-500' : 'bg-white text-ocean-800 border-ocean-200'
              }`}>{p}</button>
          ))}
        </div>
      </div>
      {err && <p className="text-sm text-coral-500">{err}</p>}
      <button type="submit" disabled={busy || !title} className="w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white font-medium text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2">
        {busy && <Loader2 className="animate-spin" size={16} />}
        投稿する
      </button>
    </form>
  );
}
