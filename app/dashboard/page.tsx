import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatYen, formatDate } from '@/lib/utils';
import { Anchor, MessageSquare, FileSignature, Plus, Star, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const [
    { data: myBoats, count: boatCount },
    { data: myWanted },
    { data: myRooms },
    { data: myContracts },
  ] = await Promise.all([
    supabase
      .from('boats')
      .select('id,title,price,status,view_count,inquiry_count,published_at', { count: 'exact' })
      .eq('seller_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20),
    supabase
      .from('wanted_posts')
      .select('id,title,budget_max,status,created_at')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('chat_rooms')
      .select('id,buyer_id,seller_id,last_message_at,boat_id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(5),
    supabase
      .from('contracts')
      .select('id,contract_title,status,created_at')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const planLabel: Record<string, string> = {
    free: '無料プラン（買い手）',
    seller_monthly: '月額プラン',
    seller_yearly: '年額プラン',
    seller_premium: 'プレミアムプラン',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* プロフィール+プラン */}
      <section className="card-soft p-6 flex flex-wrap items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-ocean-100 flex items-center justify-center text-xl">
          👤
        </div>
        <div className="flex-1 min-w-[180px]">
          <h1 className="font-display text-xl font-bold text-ocean-900">
            {profile?.display_name ?? user.email}
          </h1>
          <p className="text-xs text-ocean-700 mt-1">
            {planLabel[profile?.plan ?? 'free']}
            {profile?.plan_expires_at && profile.plan !== 'free' && (
              <span className="ml-2">（{formatDate(profile.plan_expires_at)} まで）</span>
            )}
          </p>
          {profile?.id_verified ? (
            <p className="text-[10px] text-emerald-600 mt-1">✓ 身分証確認済み</p>
          ) : (
            <Link href="/dashboard/verify" className="text-[10px] text-coral-500 mt-1 inline-block underline">
              身分証を提出（任意・取引で必要）
            </Link>
          )}
        </div>
        <Link href="/pricing" className="text-sm text-coral-500 hover:underline">プランを変更</Link>
      </section>

      {/* クイックアクション */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        <QuickTile href="/dashboard/boats/new" icon={<Plus />} label="船を出品" />
        <QuickTile href="/dashboard/parts/new" icon={<Plus />} label="パーツを出品" />
        <QuickTile href="/dashboard/wanted/new" icon={<Star />} label="探しています投稿" />
        <QuickTile href="/contracts" icon={<FileSignature />} label="契約書一覧" />
      </section>

      {/* 自分の出品 */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave">
            出品中の船 <span className="text-sm text-ocean-700">（{boatCount ?? 0}件）</span>
          </h2>
          <Link href="/dashboard/boats/new" className="text-sm text-coral-500 hover:underline">+ 新規</Link>
        </div>
        {myBoats && myBoats.length > 0 ? (
          <div className="overflow-x-auto card-soft">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ocean-700 border-b border-ocean-100">
                <tr>
                  <th className="px-4 py-3">タイトル</th>
                  <th className="px-4 py-3">価格</th>
                  <th className="px-4 py-3">状態</th>
                  <th className="px-4 py-3">閲覧</th>
                  <th className="px-4 py-3">問合せ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {myBoats.map((b) => (
                  <tr key={b.id} className="border-b border-ocean-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/boats/${b.id}`} className="text-ocean-900 hover:text-coral-500">{b.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-coral-500 font-medium">{formatYen(b.price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-ocean-700">{b.view_count ?? 0}</td>
                    <td className="px-4 py-3 text-ocean-700">{b.inquiry_count ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/boats/${b.id}/edit`} className="text-xs text-coral-500 hover:underline">編集</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-soft p-8 text-center">
            <Anchor className="mx-auto text-ocean-300 mb-3" />
            <p className="text-sm text-ocean-700">まだ出品がありません</p>
            <Link href="/dashboard/boats/new" className="inline-block mt-3 px-5 py-2 rounded-full bg-coral-500 text-white text-sm">
              はじめての出品
            </Link>
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {/* 探しています */}
        <section>
          <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave mb-3">探しています投稿</h2>
          {myWanted && myWanted.length > 0 ? (
            <ul className="card-soft divide-y divide-ocean-50">
              {myWanted.map((w) => (
                <li key={w.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-ocean-900">{w.title}</p>
                  <p className="text-xs text-ocean-700 mt-0.5">
                    {w.budget_max ? `予算 〜${formatYen(w.budget_max)}` : '予算未設定'} ・ {formatDate(w.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ocean-700">投稿はまだありません</p>
          )}
        </section>

        {/* チャット */}
        <section>
          <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave mb-3">最近のチャット</h2>
          {myRooms && myRooms.length > 0 ? (
            <ul className="card-soft divide-y divide-ocean-50">
              {myRooms.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <Link href={`/chat/${r.id}`} className="text-sm font-medium text-ocean-900 hover:text-coral-500">
                    匿名チャット
                  </Link>
                  <p className="text-xs text-ocean-700 mt-0.5">最終: {formatDate(r.last_message_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ocean-700">チャットはまだありません</p>
          )}
        </section>
      </div>

      {/* 契約 */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave mb-3">電子契約</h2>
        {myContracts && myContracts.length > 0 ? (
          <ul className="card-soft divide-y divide-ocean-50">
            {myContracts.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ocean-900">{c.contract_title}</p>
                  <p className="text-xs text-ocean-700 mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ocean-700">契約書はまだありません</p>
        )}
      </section>
    </div>
  );
}

function QuickTile({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="card-soft p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-coral-300">
      <div className="w-9 h-9 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </div>
      <p className="text-sm text-ocean-900">{label}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-ocean-100 text-ocean-800', label: '下書き' },
    published: { color: 'bg-emerald-100 text-emerald-700', label: '公開中' },
    reserved: { color: 'bg-amber-100 text-amber-700', label: '商談中' },
    sold: { color: 'bg-ocean-900 text-white', label: '成約' },
    archived: { color: 'bg-ocean-50 text-ocean-600', label: '終了' },
    pending: { color: 'bg-amber-100 text-amber-700', label: '署名待ち' },
    signed: { color: 'bg-emerald-100 text-emerald-700', label: '署名済' },
    cancelled: { color: 'bg-ocean-50 text-ocean-600', label: '取消' },
  };
  const s = map[status] ?? { color: 'bg-ocean-50 text-ocean-700', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.color}`}>{s.label}</span>;
}
