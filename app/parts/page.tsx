import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatYen } from '@/lib/utils';
import { Wrench, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PartsPage() {
  let parts: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('parts_listings')
      .select('id,title,category,condition,price,images,created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(48);
    parts = data ?? [];
  } catch {
    parts = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-900 heading-wave">パーツ売り場</h1>
          <p className="text-sm text-ocean-700 mt-3">
            エンジン、GPS、船体パーツなど、海好きが集う部品市場。
          </p>
        </div>
        <Link href="/dashboard/parts/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-coral-500 text-white text-sm font-medium">
          <Plus size={16} /> 出品する
        </Link>
      </div>

      {parts && parts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {parts.map((p) => {
            const cover = (p.images as Array<{ url: string }> | null)?.[0]?.url;
            return (
              <Link key={p.id} href={`/parts/${p.id}`} className="card-soft block overflow-hidden">
                <div className="aspect-square bg-ocean-50">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ocean-300">
                      <Wrench size={32} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-coral-500">{p.category} ・ {p.condition}</p>
                  <h3 className="text-sm font-medium text-ocean-900 mt-1 line-clamp-2">{p.title}</h3>
                  <p className="text-coral-500 font-bold mt-2">{formatYen(p.price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-ocean-200 rounded-2xl">
          <Wrench className="mx-auto text-ocean-300 mb-3" />
          <p className="text-sm text-ocean-700">まだ出品はありません。</p>
        </div>
      )}
    </div>
  );
}
