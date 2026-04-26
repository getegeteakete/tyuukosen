import { redirect } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { WantedForm } from '@/components/marketplace/wanted-form';

export default async function NewWantedPage() {
  if (!isSupabaseConfigured()) redirect('/');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard/wanted/new');
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ocean-900">「探しています」を投稿</h1>
      <p className="text-sm text-ocean-700 mt-2">条件に合う船を持つ出品者から提案が届きます。</p>
      <WantedForm userId={user.id} />
    </div>
  );
}
