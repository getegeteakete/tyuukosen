import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { formatYen, formatDate } from '@/lib/utils';
import { MapPin, Calendar, Wallet, Ruler, MessageCircle } from 'lucide-react';
import { ProposeButton } from '@/components/marketplace/propose-button';

export const dynamic = 'force-dynamic';

export default async function WantedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) notFound();
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('wanted_posts')
    .select('*, profiles:buyer_id(display_name)')
    .eq('id', id)
    .single();
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/wanted" className="text-xs text-ocean-700 hover:text-coral-500">← 探しています一覧に戻る</Link>

      <article className="card-soft p-6 mt-4">
        <h1 className="font-display text-2xl font-bold text-ocean-900">{post.title}</h1>
        {post.body && (
          <p className="mt-4 text-sm text-ocean-800 whitespace-pre-wrap leading-relaxed">{post.body}</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {(post.budget_min || post.budget_max) && (
            <Spec icon={<Wallet size={14} />} label="予算">
              {post.budget_min ? formatYen(post.budget_min) : '〜'} - {post.budget_max ? formatYen(post.budget_max) : ''}
            </Spec>
          )}
          {(post.size_min_ft || post.size_max_ft) && (
            <Spec icon={<Ruler size={14} />} label="サイズ">
              {post.size_min_ft ?? '〜'}-{post.size_max_ft ?? ''}ft
            </Spec>
          )}
          {post.preferred_period && (
            <Spec icon={<Calendar size={14} />} label="希望時期">{post.preferred_period}</Spec>
          )}
          {post.preferred_pref?.length > 0 && (
            <Spec icon={<MapPin size={14} />} label="希望地域">{post.preferred_pref.join('、')}</Spec>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-ocean-100 flex items-center justify-between">
          <p className="text-xs text-ocean-700">
            {post.profiles?.display_name ?? 'お客様'} ・ {formatDate(post.created_at)}
          </p>
          <ProposeButton wantedId={post.id} buyerId={post.buyer_id} />
        </div>
      </article>
    </div>
  );
}

function Spec({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-ocean-50/50 rounded-lg p-3">
      <p className="flex items-center gap-1 text-[10px] text-ocean-700">{icon} {label}</p>
      <p className="text-sm font-medium text-ocean-900 mt-1">{children}</p>
    </div>
  );
}
