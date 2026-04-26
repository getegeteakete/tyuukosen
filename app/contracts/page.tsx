import { redirect } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { ContractCreateButton } from '@/components/contract/contract-create-button';
import { CopyLinkInner } from '@/components/contract/copy-link';
import { FileSignature } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  if (!isSupabaseConfigured()) redirect('/');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/contracts');

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, boats(title)')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const { data: templates } = await supabase
    .from('contract_templates')
    .select('id,name,content,category')
    .order('name');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-900 heading-wave">電子契約</h1>
          <p className="text-sm text-ocean-700 mt-3">
            手書き署名でサイト内完結。トークンURLを買い手に送るだけで署名可能です。
          </p>
        </div>
        <ContractCreateButton userId={user.id} templates={templates ?? []} />
      </div>

      {contracts && contracts.length > 0 ? (
        <div className="card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ocean-700 border-b border-ocean-100 bg-ocean-50/30">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">対象船</th>
                <th className="px-4 py-3">役割</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">作成日</th>
                <th className="px-4 py-3">アクション</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const isSeller = c.seller_id === user.id;
                return (
                  <tr key={c.id} className="border-b border-ocean-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-ocean-900">{c.contract_title}</p>
                    </td>
                    <td className="px-4 py-3 text-ocean-700">
                      {c.boats?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${isSeller ? 'bg-coral-50 text-coral-600' : 'bg-ocean-50 text-ocean-700'}`}>
                        {isSeller ? '売主' : '買主'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-ocean-700">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      {c.status === 'pending' && isSeller && c.sign_token && (
                        <CopySignLinkButton token={c.sign_token} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-ocean-200 rounded-2xl">
          <FileSignature className="mx-auto text-ocean-300 mb-3" />
          <p className="text-sm text-ocean-700">まだ契約書はありません。</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    pending: { c: 'bg-amber-100 text-amber-700', l: '署名待ち' },
    signed: { c: 'bg-emerald-100 text-emerald-700', l: '署名済' },
    cancelled: { c: 'bg-ocean-50 text-ocean-700', l: '取消' },
  };
  const s = map[status] ?? { c: 'bg-ocean-50 text-ocean-700', l: status };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.c}`}>{s.l}</span>;
}

function CopySignLinkButton({ token }: { token: string }) {
  return <CopyLinkInner token={token} />;
}
