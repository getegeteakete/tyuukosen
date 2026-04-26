import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BoatForm } from '@/components/marketplace/boat-form';

export const dynamic = 'force-dynamic';

export default async function EditBoatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/dashboard/boats/${id}/edit`);

  const { data: boat } = await supabase
    .from('boats')
    .select('*')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single();
  if (!boat) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ocean-900">出品を編集</h1>
      <BoatForm mode="edit" userId={user.id} initial={boat} />
    </div>
  );
}
