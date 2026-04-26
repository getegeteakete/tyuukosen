'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runArticleWriterAgent } from '@/lib/ai/agents/article-writer';

export async function publishBoat(boatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const { data: boat } = await supabase
    .from('boats')
    .select('id, seller_id, ai_generated_article')
    .eq('id', boatId)
    .single();

  if (!boat || boat.seller_id !== user.id) return { error: 'not_found' };

  const { error } = await supabase
    .from('boats')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', boatId);
  if (error) return { error: error.message };

  // 未生成ならAI記事を非同期で生成（fire-and-forget）
  if (!boat.ai_generated_article) {
    runArticleWriterAgent({ boatId }).catch((e) => console.error('article gen failed:', e));
  }

  revalidatePath('/');
  revalidatePath('/boats');
  revalidatePath(`/boats/${boatId}`);
  return { ok: true };
}

export async function unpublishBoat(boatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  await supabase
    .from('boats')
    .update({ status: 'draft' })
    .eq('id', boatId)
    .eq('seller_id', user.id);

  revalidatePath('/');
  revalidatePath('/boats');
  return { ok: true };
}
