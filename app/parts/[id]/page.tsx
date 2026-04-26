import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatYen, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) notFound();
  const { id } = await params;
  const supabase = await createClient();

  const { data: part } = await supabase
    .from('parts_listings')
    .select('*, profiles:seller_id(display_name,id_verified)')
    .eq('id', id)
    .single();
  if (!part) notFound();

  const images = (part.images as Array<{ url: string }>) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div className="space-y-2">
        <div className="aspect-square rounded-2xl bg-ocean-50 overflow-hidden">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0].url} alt={part.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ocean-300 text-sm">画像なし</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.url} alt="" className="aspect-square object-cover rounded-md" />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-coral-500">{part.category} ・ {part.condition}</p>
        <h1 className="font-display text-2xl font-bold text-ocean-900 mt-1">{part.title}</h1>
        <p className="font-display text-3xl font-bold text-coral-500 mt-4">{formatYen(part.price)}</p>

        {part.description && (
          <div className="mt-6">
            <h2 className="font-medium text-ocean-900 mb-2">商品説明</h2>
            <p className="text-sm text-ocean-800 whitespace-pre-wrap leading-relaxed">{part.description}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-ocean-100">
          <p className="text-xs text-ocean-700">出品者: {part.profiles?.display_name ?? '出品者'}
            {part.profiles?.id_verified && <span className="ml-2 text-emerald-600">✓ 確認済み</span>}
          </p>
          <p className="text-xs text-ocean-700 mt-1">{formatDate(part.created_at)}</p>
        </div>

        <Link href="/parts" className="inline-block mt-6 text-sm text-ocean-700 hover:text-coral-500">
          ← 一覧に戻る
        </Link>
      </div>
    </div>
  );
}
