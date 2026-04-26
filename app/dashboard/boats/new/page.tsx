import { redirect, notFound } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { BoatForm } from '@/components/marketplace/boat-form';

export const dynamic = 'force-dynamic';

export default async function NewBoatPage() {
  if (!isSupabaseConfigured()) redirect('/');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard/boats/new');

  // プラン+枠チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, boat_slot_extra')
    .eq('user_id', user.id)
    .single();

  const baseSlots = ['seller_monthly','seller_yearly','seller_premium'].includes(profile?.plan ?? '') ? 5 : 0;
  const totalSlots = baseSlots + (profile?.boat_slot_extra ?? 0);

  const { count } = await supabase
    .from('boats')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)
    .neq('status', 'archived');

  const remain = totalSlots - (count ?? 0);

  if (totalSlots === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-ocean-900">出品プランへの加入が必要です</h1>
        <p className="text-sm text-ocean-700 mt-3">
          月額¥3,000 または 年額¥30,000 で5隻まで掲載できます。
        </p>
        <a href="/pricing" className="inline-block mt-6 px-6 py-3 rounded-full bg-coral-500 text-white text-sm font-medium">
          出品プランを見る
        </a>
      </div>
    );
  }

  if (remain <= 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-ocean-900">出品枠が上限です</h1>
        <p className="text-sm text-ocean-700 mt-3">
          現在 {totalSlots} 隻まで掲載可能です。10隻ずつ枠を追加できます（+¥10,000）。
        </p>
        <a href="/pricing" className="inline-block mt-6 px-6 py-3 rounded-full bg-coral-500 text-white text-sm font-medium">
          追加枠を購入
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-xs text-ocean-700">残り出品枠: {remain} / {totalSlots}</p>
      <h1 className="font-display text-2xl font-bold text-ocean-900 mt-1">船を出品する</h1>
      <p className="text-sm text-ocean-700 mt-2">
        AIアシスタントを使うと、話しかけるだけで自動入力できます（右下のFABから）。
      </p>
      <BoatForm mode="create" userId={user.id} />
    </div>
  );
}
