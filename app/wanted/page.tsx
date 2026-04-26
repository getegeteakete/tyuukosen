import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatYen, formatDate } from '@/lib/utils';
import { Plus, MapPin, Calendar, Wallet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WantedPage() {
  let posts: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('wanted_posts')
      .select('id,title,body,budget_min,budget_max,size_min_ft,size_max_ft,preferred_period,preferred_pref,created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(40);
    posts = data ?? [];
  } catch {
    posts = [];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-900 heading-wave">
            探しています
          </h1>
          <p className="text-sm text-ocean-700 mt-3">
            買い手が「こんな船を探してる」と公開している投稿一覧。
            条件に合う船をお持ちなら、チャットで提案してみましょう。
          </p>
        </div>
        <Link href="/dashboard/wanted/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coral-500 text-white text-sm font-medium">
          <Plus size={16} /> 投稿する
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <article key={p.id} className="card-soft p-5">
              <h3 className="font-medium text-ocean-900">{p.title}</h3>
              {p.body && <p className="text-sm text-ocean-700 mt-2 line-clamp-3">{p.body}</p>}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ocean-700">
                {(p.budget_min || p.budget_max) && (
                  <p className="flex items-center gap-1">
                    <Wallet size={12} />
                    予算 {p.budget_min ? formatYen(p.budget_min) : '〜'} - {p.budget_max ? formatYen(p.budget_max) : ''}
                  </p>
                )}
                {(p.size_min_ft || p.size_max_ft) && (
                  <p>サイズ {p.size_min_ft ?? '〜'}-{p.size_max_ft ?? ''}ft</p>
                )}
                {p.preferred_period && (
                  <p className="flex items-center gap-1">
                    <Calendar size={12} /> {p.preferred_period}
                  </p>
                )}
                {p.preferred_pref && p.preferred_pref.length > 0 && (
                  <p className="flex items-center gap-1">
                    <MapPin size={12} /> {p.preferred_pref.join('、')}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-ocean-100 flex items-center justify-between">
                <p className="text-[11px] text-ocean-700">{formatDate(p.created_at)}</p>
                <Link href={`/wanted/${p.id}`} className="text-xs text-coral-500 hover:underline">
                  提案する →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-ocean-200 rounded-2xl">
          <p className="text-sm text-ocean-700">まだ投稿はありません。最初の投稿者になりませんか？</p>
        </div>
      )}
    </div>
  );
}
