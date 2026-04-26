/**
 * Registrar Agent — 出品登録支援
 *
 * ユーザーが「2018年式のヤマハの船で、3.5mで〜」と話した内容から
 * boats テーブルに insert できる下書きを作成する。
 * 写真や動画は別途UIからアップロードされる前提。
 */
import { createServiceClient } from '@/lib/supabase/service';

export interface RegistrarInput {
  userId: string;
  extracted: {
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    length_ft?: number;
    hull_material?: string;
    engine_type?: string;
    engine_hours?: number;
    location_pref?: string;
    location_city?: string;
    price?: number;
    description?: string;
    features?: string[];
  };
  parentJobId?: string;
}

export async function runRegistrarAgent(input: RegistrarInput) {
  const supabase = createServiceClient();

  // 出品枠チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, boat_slot_extra')
    .eq('user_id', input.userId)
    .single();

  const baseSlots = ['seller_monthly', 'seller_yearly', 'seller_premium'].includes(
    profile?.plan ?? ''
  )
    ? 5
    : 0;
  const totalSlots = baseSlots + (profile?.boat_slot_extra ?? 0);

  const { count } = await supabase
    .from('boats')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', input.userId)
    .neq('status', 'archived');

  if ((count ?? 0) >= totalSlots) {
    return {
      ok: false,
      reason: 'slot_full',
      message: `現在の出品枠（${totalSlots}隻）が上限に達しています。プラン変更または追加枠の購入をご検討ください。`,
    };
  }

  // ドラフト作成
  const draft = {
    seller_id: input.userId,
    title: input.extracted.title ?? '無題の船',
    brand: input.extracted.brand,
    model: input.extracted.model,
    year: input.extracted.year,
    length_ft: input.extracted.length_ft,
    hull_material: input.extracted.hull_material,
    engine_type: input.extracted.engine_type,
    engine_hours: input.extracted.engine_hours,
    location_pref: input.extracted.location_pref,
    location_city: input.extracted.location_city,
    price: input.extracted.price ?? 0,
    description: input.extracted.description,
    features: input.extracted.features ?? [],
    status: 'draft',
  };

  const { data: boat, error } = await supabase
    .from('boats')
    .insert(draft)
    .select()
    .single();

  if (error) return { ok: false, reason: 'db_error', message: error.message };

  // 不足項目をチェック
  const missing: string[] = [];
  if (!boat.title || boat.title === '無題の船') missing.push('タイトル');
  if (!boat.price || boat.price === 0) missing.push('価格');
  if (!boat.location_pref) missing.push('所在地（都道府県）');

  // ジョブ完了をchainで記録
  await supabase.from('ai_jobs').insert({
    agent: 'registrar',
    task: 'create_draft',
    payload: input.extracted,
    status: 'done',
    result: { boat_id: boat.id },
    parent_job_id: input.parentJobId,
    finished_at: new Date().toISOString(),
  });

  return {
    ok: true,
    boat_id: boat.id,
    next_steps: missing.length > 0 ? { missing } : { ready_to_publish: true },
  };
}
