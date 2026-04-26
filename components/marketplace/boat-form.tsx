'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, Sparkles, X } from 'lucide-react';

interface Initial {
  id?: string;
  title?: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  length_ft?: number | null;
  hull_material?: string | null;
  engine_type?: string | null;
  engine_hours?: number | null;
  fuel_type?: string | null;
  location_pref?: string | null;
  location_city?: string | null;
  price?: number;
  negotiable?: boolean;
  description?: string | null;
  features?: string[];
  cover_image_url?: string | null;
  images?: Array<{ url: string }>;
  video_url?: string | null;
  status?: string;
}

const PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','静岡県','愛知県','三重県','京都府','大阪府','兵庫県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

const COMMON_FEATURES = ['GPS','魚群探知機','VHF無線','オートパイロット','トイレ','キッチン','ベッド','エアコン','発電機','ビミニトップ','トレーラー付き','船検残あり'];

export function BoatForm({
  mode, userId, initial,
}: { mode: 'create' | 'edit'; userId: string; initial?: Initial }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<Initial>({
    title: initial?.title ?? '',
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    year: initial?.year ?? undefined,
    length_ft: initial?.length_ft ?? undefined,
    hull_material: initial?.hull_material ?? 'FRP',
    engine_type: initial?.engine_type ?? '船外機',
    engine_hours: initial?.engine_hours ?? undefined,
    fuel_type: initial?.fuel_type ?? 'ガソリン',
    location_pref: initial?.location_pref ?? '',
    location_city: initial?.location_city ?? '',
    price: initial?.price ?? 0,
    negotiable: initial?.negotiable ?? true,
    description: initial?.description ?? '',
    features: initial?.features ?? [],
    cover_image_url: initial?.cover_image_url ?? '',
    images: initial?.images ?? [],
    video_url: initial?.video_url ?? '',
  });

  function set<K extends keyof Initial>(key: K, val: Initial[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleFeature(f: string) {
    setForm((s) => {
      const arr = s.features ?? [];
      return arr.includes(f)
        ? { ...s, features: arr.filter((x) => x !== f) }
        : { ...s, features: [...arr, f] };
    });
  }

  async function uploadFile(bucket: 'boats' | 'videos', file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub.publicUrl;
  }

  async function onCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile('boats', file);
      set('cover_image_url', url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadFile('boats', f)));
      const next = [...(form.images ?? []), ...urls.map((url) => ({ url }))];
      set('images', next);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setErr('動画は100MB以下にしてください'); return; }
    setBusy(true);
    try {
      const url = await uploadFile('videos', file);
      set('video_url', url);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  function removeGalleryAt(i: number) {
    set('images', (form.images ?? []).filter((_, idx) => idx !== i));
  }

  async function save(publish: boolean) {
    setErr(null); setBusy(true);
    const supabase = createClient();
    try {
      const body = {
        seller_id: userId,
        title: form.title,
        brand: form.brand || null,
        model: form.model || null,
        year: form.year ?? null,
        length_ft: form.length_ft ?? null,
        hull_material: form.hull_material || null,
        engine_type: form.engine_type || null,
        engine_hours: form.engine_hours ?? null,
        fuel_type: form.fuel_type || null,
        location_pref: form.location_pref || null,
        location_city: form.location_city || null,
        price: Number(form.price) || 0,
        negotiable: form.negotiable ?? true,
        description: form.description || null,
        features: form.features ?? [],
        cover_image_url: form.cover_image_url || null,
        images: form.images ?? [],
        video_url: form.video_url || null,
        status: publish ? 'published' : 'draft',
        ...(publish ? { published_at: new Date().toISOString() } : {}),
      };

      let id = initial?.id;
      if (mode === 'create') {
        const { data, error } = await supabase.from('boats').insert(body).select('id').single();
        if (error) throw error;
        id = data.id;
      } else {
        const { error } = await supabase.from('boats').update(body).eq('id', initial!.id!);
        if (error) throw error;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* タイトル */}
      <Field label="タイトル" required>
        <input
          required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
          placeholder="例: ヤマハ FR-28 2018年式 福岡県"
          className={inputCls}
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="メーカー">
          <input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} className={inputCls} placeholder="ヤマハ / トヨタ / SeaRay 等" />
        </Field>
        <Field label="モデル">
          <input value={form.model ?? ''} onChange={(e) => set('model', e.target.value)} className={inputCls} />
        </Field>
        <Field label="年式">
          <input type="number" value={form.year ?? ''} onChange={(e) => set('year', Number(e.target.value) || undefined)} className={inputCls} />
        </Field>
        <Field label="全長（ft）">
          <input type="number" step="0.1" value={form.length_ft ?? ''} onChange={(e) => set('length_ft', Number(e.target.value) || undefined)} className={inputCls} />
        </Field>
        <Field label="船体材質">
          <select value={form.hull_material ?? ''} onChange={(e) => set('hull_material', e.target.value)} className={inputCls}>
            {['FRP','アルミ','木造','スチール','その他'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="エンジン形式">
          <select value={form.engine_type ?? ''} onChange={(e) => set('engine_type', e.target.value)} className={inputCls}>
            {['船外機','船内機','船内外機','その他'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="エンジン使用時間">
          <input type="number" value={form.engine_hours ?? ''} onChange={(e) => set('engine_hours', Number(e.target.value) || undefined)} className={inputCls} placeholder="時間" />
        </Field>
        <Field label="燃料">
          <select value={form.fuel_type ?? ''} onChange={(e) => set('fuel_type', e.target.value)} className={inputCls}>
            {['ガソリン','軽油','その他'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="都道府県" required>
          <select required value={form.location_pref ?? ''} onChange={(e) => set('location_pref', e.target.value)} className={inputCls}>
            <option value="">選択</option>
            {PREFS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="市町村">
          <input value={form.location_city ?? ''} onChange={(e) => set('location_city', e.target.value)} className={inputCls} />
        </Field>
        <Field label="価格（円）" required>
          <input required type="number" value={form.price ?? 0} onChange={(e) => set('price', Number(e.target.value))} className={inputCls} />
        </Field>
      </div>

      <Field label="装備（複数選択可）">
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((f) => (
            <button
              type="button" key={f} onClick={() => toggleFeature(f)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                form.features?.includes(f)
                  ? 'bg-coral-500 text-white border-coral-500'
                  : 'bg-white text-ocean-800 border-ocean-200 hover:border-coral-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Field>

      <Field label="紹介文" hint="未入力でもOK・公開時にAIが自動生成します">
        <textarea
          rows={6} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
          className={inputCls + ' resize-y'} placeholder="この船の魅力、購入のきっかけ、整備履歴など…"
        />
      </Field>

      {/* カバー画像 */}
      <Field label="カバー画像" required>
        {form.cover_image_url ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.cover_image_url} alt="" className="w-64 h-44 object-cover rounded-lg" />
            <button type="button" onClick={() => set('cover_image_url', '')} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-coral-500 text-white flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
        ) : (
          <UploadBox onChange={onCoverUpload} accept="image/*" />
        )}
      </Field>

      <Field label="ギャラリー（複数枚）">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {(form.images ?? []).map((img, i) => (
            <div key={i} className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover rounded-md" />
              <button type="button" onClick={() => removeGalleryAt(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center">
                <X size={12} />
              </button>
            </div>
          ))}
          <UploadBox onChange={onGalleryUpload} accept="image/*" multiple compact />
        </div>
      </Field>

      <Field label="動画（任意・100MBまで）">
        {form.video_url ? (
          <div>
            <video src={form.video_url} controls className="w-full max-w-md rounded-md" />
            <button type="button" onClick={() => set('video_url', '')} className="mt-2 text-xs text-coral-500 underline">削除</button>
          </div>
        ) : (
          <UploadBox onChange={onVideoUpload} accept="video/*" label="動画を追加" />
        )}
      </Field>

      {err && <p className="text-sm text-coral-500 bg-coral-50 p-3 rounded">{err}</p>}

      <div className="flex flex-wrap gap-3 sticky bottom-4 bg-white/85 backdrop-blur p-3 rounded-2xl border border-ocean-100 z-10">
        <button
          type="button" onClick={() => save(false)} disabled={busy}
          className="px-5 py-2.5 rounded-full border border-ocean-200 text-ocean-900 hover:bg-ocean-50 text-sm disabled:opacity-50"
        >
          {busy ? <Loader2 className="inline animate-spin" size={14} /> : '下書き保存'}
        </button>
        <button
          type="button" onClick={() => save(true)} disabled={busy || !form.title || !form.cover_image_url || !form.price}
          className="px-6 py-2.5 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-40 inline-flex items-center gap-2"
        >
          {busy && <Loader2 className="animate-spin" size={14} />}
          <Sparkles size={14} />
          公開する（AI記事生成 + SNS告知）
        </button>
      </div>
    </form>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-md border border-ocean-200 outline-none focus:border-coral-400 text-sm bg-white';

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-ocean-800">
        {label}{required && <span className="text-coral-500 ml-0.5">*</span>}
        {hint && <span className="ml-2 text-ocean-700 font-normal">{hint}</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function UploadBox({
  onChange, accept, multiple, compact, label,
}: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; accept: string; multiple?: boolean; compact?: boolean; label?: string }) {
  return (
    <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed border-ocean-200 hover:border-coral-300 hover:bg-coral-50/30 text-ocean-700 ${compact ? 'aspect-[4/3]' : 'h-28'}`}>
      <Upload size={compact ? 16 : 18} />
      {!compact && <span className="text-xs">{label ?? 'クリックまたはドラッグ&ドロップ'}</span>}
      <input type="file" accept={accept} multiple={multiple} onChange={onChange} className="hidden" />
    </label>
  );
}
