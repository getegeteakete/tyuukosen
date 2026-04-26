'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Video } from 'lucide-react';

function ViewingForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const boatId = sp.get('boat');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [boat, setBoat] = useState<any>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!boatId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('boats')
        .select('id,title,seller_id,cover_image_url')
        .eq('id', boatId)
        .single();
      setBoat(data);
    })();
  }, [boatId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!boat) return;
    setBusy(true); setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/auth/login?redirect=/dashboard/viewings/new?boat=${boatId}`); return; }

    const scheduledAt = new Date(`${date}T${time}:00`);
    const { error } = await supabase.from('viewing_appointments').insert({
      boat_id: boat.id,
      buyer_id: user.id,
      seller_id: boat.seller_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_min: duration,
      notes: notes || null,
      status: 'pending',
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push('/dashboard');
    router.refresh();
  }

  if (!boatId) {
    return <p className="text-sm text-ocean-700">船を選択してから予約してください。</p>;
  }
  if (!boat) {
    return <Loader2 className="animate-spin text-ocean-500" />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Video className="mx-auto text-coral-500" size={32} />
        <h1 className="font-display text-2xl font-bold text-ocean-900 mt-3">ZOOM見学を予約</h1>
        <p className="text-sm text-ocean-700 mt-2">出品者と日時調整のうえ、ZOOMリンクをお送りします。</p>
      </div>

      <div className="card-soft p-3 flex items-center gap-3 mb-6">
        {boat.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={boat.cover_image_url} className="w-16 h-12 rounded object-cover" alt="" />
        )}
        <p className="text-sm font-medium text-ocean-900">{boat.title}</p>
      </div>

      <form onSubmit={submit} className="card-soft p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ocean-800">希望日<span className="text-coral-500">*</span></label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-ocean-800">希望時刻<span className="text-coral-500">*</span></label>
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">所要時間（分）</label>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm">
            {[15, 30, 45, 60].map(n => <option key={n} value={n}>{n}分</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">確認したいポイント</label>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm resize-y" placeholder="エンジン音、船底の状態など" />
        </div>
        {err && <p className="text-sm text-coral-500">{err}</p>}
        <button type="submit" disabled={busy || !date} className="w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="animate-spin" size={14} />} 予約リクエストを送る
        </button>
        <p className="text-[11px] text-ocean-700 text-center">
          予約は出品者の承認後に確定します。ZOOMリンクは確定時にメール通知。
        </p>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="animate-spin inline" /></div>}>
      <ViewingForm />
    </Suspense>
  );
}
