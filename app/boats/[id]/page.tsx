import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatYen, sanitizeHtml } from '@/lib/utils';
import { MapPin, Calendar, Ruler, Cpu, MessageCircle, Video, Shield, Heart } from 'lucide-react';
import { ContactCta } from '@/components/marketplace/contact-cta';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return {};
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: boat } = await supabase
      .from('boats')
      .select('title,brand,year,location_pref,cover_image_url,description,ai_seo_keywords')
      .eq('id', id)
      .single();
    if (!boat) return {};
    return {
      title: `${boat.title} | 中古船`,
      description: (boat.description ?? '').slice(0, 120),
      keywords: boat.ai_seo_keywords,
      openGraph: { images: boat.cover_image_url ? [boat.cover_image_url] : [] },
    };
  } catch {
    return {};
  }
}

export default async function BoatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) notFound();
  const { id } = await params;
  const supabase = await createClient();

  const { data: boat } = await supabase
    .from('boats')
    .select('*')
    .eq('id', id)
    .single();
  if (!boat) notFound();

  // 出品者プロフィール
  const { data: seller } = await supabase
    .from('profiles')
    .select('display_name,company_name,avatar_url,id_verified')
    .eq('user_id', boat.seller_id)
    .single();

  // 閲覧カウント（fire-and-forget・失敗しても続行）
  try { await supabase.rpc('increment_view', { boat_id_in: id }); } catch {}

  const images: Array<{ url: string; caption?: string }> =
    Array.isArray(boat.images) && boat.images.length > 0
      ? boat.images
      : boat.cover_image_url
      ? [{ url: boat.cover_image_url }]
      : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Gallery */}
        <div className="space-y-2">
          <div className="aspect-[16/10] rounded-2xl bg-ocean-50 overflow-hidden">
            {boat.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={boat.cover_image_url} alt={boat.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ocean-300">画像なし</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img.url} alt="" className="aspect-[4/3] object-cover rounded-md" />
              ))}
            </div>
          )}
          {boat.video_url && (
            <video src={boat.video_url} controls className="w-full rounded-2xl mt-2" />
          )}
        </div>

        {/* タイトル+主要情報 */}
        <div>
          <p className="text-xs text-coral-500 font-medium">{boat.brand}{boat.model ? ` · ${boat.model}` : ''}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ocean-900 mt-1">
            {boat.title}
          </h1>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Spec icon={<Calendar size={14} />} label="年式" value={boat.year ? `${boat.year}年` : '—'} />
            <Spec icon={<Ruler size={14} />} label="全長" value={boat.length_ft ? `${boat.length_ft}ft` : '—'} />
            <Spec icon={<Cpu size={14} />} label="エンジン" value={boat.engine_type ?? '—'} />
            <Spec icon={<MapPin size={14} />} label="所在地" value={boat.location_pref ?? '—'} />
          </div>
        </div>

        {/* 装備 */}
        {boat.features && boat.features.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave mb-3">装備・特徴</h2>
            <div className="flex flex-wrap gap-2">
              {(boat.features as string[]).map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-ocean-50 text-ocean-800 text-xs">
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* AI生成記事 / 詳細説明 */}
        <section>
          <h2 className="font-display text-lg font-bold text-ocean-900 heading-wave mb-3">
            この船について
          </h2>
          {boat.ai_generated_article ? (
            <article
              className="prose prose-sm max-w-none prose-headings:text-ocean-900 prose-p:text-ocean-800"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(mdLite(boat.ai_generated_article)) }}
            />
          ) : (
            <p className="text-sm text-ocean-800 whitespace-pre-wrap leading-relaxed">
              {boat.description ?? '紹介文は準備中です。'}
            </p>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="card-soft p-5 sticky top-20">
          <p className="text-xs text-ocean-700">販売価格</p>
          <p className="font-display text-3xl font-bold text-coral-500 mt-1">
            {formatYen(boat.price)}
          </p>
          {boat.negotiable && <p className="text-[11px] text-ocean-700 mt-0.5">価格相談可</p>}

          {/* 出品者 */}
          <div className="mt-5 pt-5 border-t border-ocean-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ocean-100 overflow-hidden flex items-center justify-center text-xs text-ocean-700">
                {seller?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ocean-900 truncate">
                  {seller?.display_name ?? seller?.company_name ?? '出品者'}
                </p>
                {seller?.id_verified && (
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <Shield size={10} /> 身分証確認済み
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <ContactCta boatId={boat.id} sellerId={boat.seller_id} />

          <p className="mt-4 text-[10px] text-ocean-700 text-center">
            匿名チャットで開始されます。連絡先公開は双方の合意後。
          </p>
        </div>

        <div className="card-soft p-5 text-xs text-ocean-700 space-y-2">
          <p className="flex items-center gap-2"><Shield size={14} className="text-emerald-500" /> 取引前に身分証チェックを実施</p>
          <p className="flex items-center gap-2"><MessageCircle size={14} className="text-ocean-500" /> 匿名チャットで質問OK</p>
          <p className="flex items-center gap-2"><Video size={14} className="text-coral-500" /> ZOOMで遠隔見学予約可</p>
          <p className="flex items-center gap-2"><Heart size={14} className="text-coral-500" /> サイト内電子契約に対応</p>
        </div>
      </aside>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-soft p-3">
      <p className="flex items-center gap-1 text-[10px] text-ocean-700">{icon} {label}</p>
      <p className="text-sm font-medium text-ocean-900 mt-1">{value}</p>
    </div>
  );
}

/** 簡易マークダウンレンダ（h2, p, ul, strongのみ）*/
function mdLite(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n').map((para) =>
      /^<(h2|h3|ul)/.test(para.trim()) ? para : `<p>${para}</p>`
    ).join('\n');
}
