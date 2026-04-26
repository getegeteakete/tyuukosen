'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';

export default function NewPartPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('エンジン');
  const [condition, setCondition] = useState('中古良好');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  async function uploadImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('ログインしてください'); setBusy(false); return; }
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const { error } = await supabase.storage.from('parts').upload(path, file);
        if (error) throw error;
        return supabase.storage.from('parts').getPublicUrl(path).data.publicUrl;
      }));
      setImages((s) => [...s, ...urls]);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('ログインしてください'); setBusy(false); return; }

    const { error } = await supabase.from('parts_listings').insert({
      seller_id: user.id,
      title, category, condition,
      price: Number(price),
      description: description || null,
      images: images.map((url) => ({ url })),
      status: 'published',
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push('/parts');
    router.refresh();
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-md border border-ocean-200 outline-none focus:border-coral-400 text-sm';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ocean-900">パーツを出品</h1>
      <form onSubmit={submit} className="mt-8 card-soft p-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-ocean-800">タイトル<span className="text-coral-500">*</span></label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={'mt-1.5 ' + inputCls} placeholder="例: ヤマハ 60馬力 船外機" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ocean-800">カテゴリ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={'mt-1.5 ' + inputCls}>
              {['エンジン','GPS・魚探','船体パーツ','プロペラ','電装','釣り具','その他'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ocean-800">状態</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={'mt-1.5 ' + inputCls}>
              {['新品','中古良好','中古難あり','ジャンク'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">価格（円）<span className="text-coral-500">*</span></label>
          <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={'mt-1.5 ' + inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">説明</label>
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={'mt-1.5 ' + inputCls + ' resize-y'} />
        </div>
        <div>
          <label className="text-xs font-medium text-ocean-800">画像</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((u, i) => (
              <div key={i} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="w-full h-full object-cover rounded-md" />
                <button type="button" onClick={() => setImages((s) => s.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center"><X size={12} /></button>
              </div>
            ))}
            <label className="aspect-square flex items-center justify-center border-2 border-dashed border-ocean-200 rounded-md cursor-pointer text-ocean-700 hover:border-coral-300">
              <Upload size={16} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImg} />
            </label>
          </div>
        </div>
        {err && <p className="text-sm text-coral-500">{err}</p>}
        <button type="submit" disabled={busy || !title || !price} className="w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="animate-spin" size={14} />} 出品する
        </button>
      </form>
    </div>
  );
}
