import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BoatCard } from '@/components/marketplace/boat-card';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  pref?: string;
  min?: string;
  max?: string;
  type?: string;
  page?: string;
}

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  let boats: any[] = [];
  let total = 0;

  try {
    const supabase = await createClient();

    const page = Math.max(1, parseInt(sp.page ?? '1', 10));
    const perPage = 16;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let q = supabase
      .from('boats')
      .select('id,title,brand,year,length_ft,price,location_pref,cover_image_url,is_premium', { count: 'exact' })
      .eq('status', 'published')
      .order('is_premium', { ascending: false })
      .order('published_at', { ascending: false });

    if (sp.q) {
      q = q.or(`title.ilike.%${sp.q}%,brand.ilike.%${sp.q}%,description.ilike.%${sp.q}%`);
    }
    if (sp.pref) q = q.eq('location_pref', sp.pref);
    if (sp.min) q = q.gte('price', parseInt(sp.min, 10));
    if (sp.max) q = q.lte('price', parseInt(sp.max, 10));

    const { data, count } = await q.range(from, to);
    boats = data ?? [];
    total = count ?? 0;
  } catch {
    boats = [];
    total = 0;
  }

  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10));
  const lastPage = Math.max(1, Math.ceil(total / 16));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ocean-900 heading-wave mb-6">
        中古船を探す
      </h1>

      {/* Filters */}
      <form action="/boats" method="GET" className="mb-8 flex flex-wrap gap-2 items-center bg-white border border-ocean-100 rounded-2xl p-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <Search className="text-ocean-500" size={16} />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="船名・メーカー"
            className="flex-1 outline-none text-sm py-2"
          />
        </div>
        <select name="pref" defaultValue={sp.pref} className="px-3 py-2 rounded-md border border-ocean-200 text-sm">
          <option value="">都道府県</option>
          {['北海道','青森県','東京都','神奈川県','静岡県','愛知県','大阪府','広島県','福岡県','長崎県','沖縄県'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input name="min" defaultValue={sp.min} placeholder="¥下限" type="number" className="w-24 px-3 py-2 rounded-md border border-ocean-200 text-sm" />
        <input name="max" defaultValue={sp.max} placeholder="¥上限" type="number" className="w-24 px-3 py-2 rounded-md border border-ocean-200 text-sm" />
        <button className="px-4 py-2 rounded-md bg-coral-500 text-white text-sm font-medium">絞り込み</button>
      </form>

      <p className="text-xs text-ocean-700 mb-4">{total.toLocaleString()}件</p>

      {boats && boats.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {boats.map((b) => <BoatCard key={b.id} boat={b} />)}
          </div>

          {lastPage > 1 && (
            <nav className="mt-10 flex justify-center gap-1">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => {
                const params = new URLSearchParams();
                if (sp.q) params.set('q', sp.q);
                if (sp.pref) params.set('pref', sp.pref);
                if (sp.min) params.set('min', sp.min);
                if (sp.max) params.set('max', sp.max);
                params.set('page', String(p));
                return (
                  <Link
                    key={p}
                    href={`/boats?${params}`}
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-sm ${
                      p === pageNum ? 'bg-ocean-900 text-white' : 'border border-ocean-200 hover:border-coral-300'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-20 border border-dashed border-ocean-200 rounded-2xl">
          <p className="text-ocean-700 text-sm">条件に合う船が見つかりませんでした。</p>
          <p className="mt-2 text-xs text-ocean-700">右下のAIアシスタントに条件を伝えると、近い船を提案してもらえます。</p>
        </div>
      )}
    </div>
  );
}
