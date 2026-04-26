'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Loader2, FileText } from 'lucide-react';

interface Template { id: string; name: string; content: string; category?: string | null }

export function ContractCreateButton({ userId, templates }: { userId: string; templates: Template[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coral-500 text-white text-sm font-medium">
        <Plus size={16} /> 契約書を作成
      </button>
      {open && <Dialog userId={userId} templates={templates} onClose={() => setOpen(false)} />}
    </>
  );
}

function Dialog({
  userId, templates, onClose,
}: { userId: string; templates: Template[]; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [boatId, setBoatId] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [price, setPrice] = useState<number | undefined>();

  function applyTemplate(tplId: string) {
    const t = templates.find((x) => x.id === tplId);
    if (!t) return;
    setTitle(t.name);
    setContent(t.content);
  }

  function buildContent(): string {
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    return content
      .replaceAll('{{seller_name}}', sellerName || '（売主）')
      .replaceAll('{{buyer_name}}', buyerName || '（買主）')
      .replaceAll('{{boat_title}}', '—')
      .replaceAll('{{brand}}', '—')
      .replaceAll('{{year}}', '—')
      .replaceAll('{{hull_material}}', '—')
      .replaceAll('{{price}}', price ? price.toLocaleString() : '—')
      .replaceAll('{{delivery_date}}', '—')
      .replaceAll('{{today}}', today);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const supabase = createClient();

    // buyerEmail から user_id を引く
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', buyerEmail)
      .maybeSingle();

    if (!buyerProfile) {
      setErr('指定のメールアドレスのユーザーが見つかりません。先に会員登録してもらってください。');
      setBusy(false);
      return;
    }

    const { error } = await supabase.from('contracts').insert({
      seller_id: userId,
      buyer_id: buyerProfile.user_id,
      boat_id: boatId || null,
      contract_title: title,
      contract_content: buildContent(),
      status: 'pending',
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-ocean-900/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-10 shadow-2xl border border-ocean-100">
        <div className="px-5 py-4 border-b border-ocean-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ocean-900">契約書を作成</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-ocean-50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* ひな形選択 */}
          <div>
            <label className="text-xs font-medium text-ocean-800 flex items-center gap-1">
              <FileText size={12} /> ひな形（任意）
            </label>
            <select
              onChange={(e) => applyTemplate(e.target.value)}
              defaultValue=""
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm"
            >
              <option value="">選択しない（自由記述）</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ocean-800">タイトル</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ocean-800">売主名</label>
              <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-ocean-800">買主名</label>
              <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-ocean-800">買主メール（送付先）</label>
              <input required type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-ocean-800">価格（円）</label>
              <input type="number" value={price ?? ''} onChange={(e) => setPrice(Number(e.target.value) || undefined)} className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ocean-800">本文</label>
            <textarea
              required rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-md border border-ocean-200 text-sm font-mono resize-y"
              placeholder="プレースホルダー: {{seller_name}} {{buyer_name}} {{price}} {{today}}"
            />
            <p className="text-[11px] text-ocean-700 mt-1">
              ※ プレースホルダーは保存時に上記入力で自動置換されます。
            </p>
          </div>

          {err && <p className="text-sm text-coral-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full border border-ocean-200 text-sm">キャンセル</button>
            <button type="submit" disabled={busy} className="px-5 py-2 rounded-full bg-coral-500 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
              {busy && <Loader2 className="animate-spin" size={14} />} 作成して署名URLを発行
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
