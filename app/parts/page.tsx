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
    <>
      {/* ============== Hero ============== */}
      <section className="relative overflow-hidden isolate min-h-[500px] md:min-h-[560px]">
        <div
          className="absolute inset-0 z-0 bg-ocean-900 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero/parts-poster.jpg)' }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            poster="/hero/parts-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src="/hero/parts.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/65 via-ocean-900/45 to-sand-50/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/20 via-transparent to-ocean-900/20" />
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full text-sand-50 z-[5] pointer-events-none"
          viewBox="0 0 1440 80" preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-28 md:pt-20 md:pb-32 text-center">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-coral-600 text-xs font-medium mb-5 shadow-sm">
            <Wrench size={14} /> 海のプロが集うパーツ市場
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <span className="text-coral-300">パーツ</span>を、賢く譲りあう。
          </h1>
          <p className="mt-5 text-white/95 max-w-xl mx-auto text-sm md:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            エンジン、GPS、船体パーツ、釣り具まで。
            <br className="hidden sm:block" />
            眠っているパーツが、誰かの航海を支えるかもしれません。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/parts/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium shadow-lg"
            >
              <Plus size={16} /> パーツを出品
            </Link>
            <a
              href="#parts-list"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 backdrop-blur text-ocean-900 hover:bg-white text-sm font-medium shadow-lg"
            >
              一覧を見る ↓
            </a>
          </div>
        </div>
      </section>

      {/* ============== Parts list ============== */}
      <section id="parts-list" className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ocean-900 heading-wave">
              パーツ一覧
            </h2>
            <p className="text-sm text-ocean-700 mt-3">
              {parts.length > 0 ? `${parts.length}件の出品` : '新着出品をお待ちください'}
            </p>
          </div>
        </div>

        {parts.length > 0 ? (
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
            <p className="text-sm text-ocean-700">まだ出品はありません。最初の出品者になりませんか？</p>
            <Link href="/dashboard/parts/new" className="inline-block mt-4 px-5 py-2 rounded-full bg-coral-500 text-white text-sm">
              パーツを出品する
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
