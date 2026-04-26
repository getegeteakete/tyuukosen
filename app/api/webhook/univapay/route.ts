/**
 * UnivaPay Webhook
 * - charge.successful → orders を paid に更新 → profilesのプラン更新
 * - subscription.canceled → プラン解除
 *
 * 設定: UnivaPay管理画面でWebhook URLを
 *       https://your-domain.vercel.app/api/webhook/univapay
 *       認証ヘッダー: X-Webhook-Secret: ${UNIVAPAY_WEBHOOK_SECRET}
 */
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.UNIVAPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  const event = await req.json();
  const supabase = createServiceClient();

  // metadata.userId / metadata.product_type で識別
  const meta = event?.data?.metadata ?? {};
  const userId: string | undefined = meta.userId;
  const productType: string | undefined = meta.product_type;
  const orderId: string | undefined = meta.orderId;

  switch (event.event) {
    case 'charge_finished':
    case 'charge.successful': {
      if (orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            univapay_charge_id: event.data?.id,
          })
          .eq('id', orderId);
      }

      if (userId && productType) {
        await applyPlanChange(supabase, userId, productType);
      }
      break;
    }

    case 'subscription.canceled':
    case 'subscription_canceled': {
      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan: 'free', plan_expires_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
      break;
    }

    case 'charge.failed':
    case 'charge_failed': {
      if (orderId) {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}

async function applyPlanChange(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  productType: string
) {
  const now = new Date();
  const expires = new Date(now);

  switch (productType) {
    case 'subscription_seller_monthly':
      expires.setMonth(expires.getMonth() + 1);
      await supabase
        .from('profiles')
        .update({
          role: 'seller',
          plan: 'seller_monthly',
          plan_started_at: now.toISOString(),
          plan_expires_at: expires.toISOString(),
        })
        .eq('user_id', userId);
      break;
    case 'subscription_seller_yearly':
      expires.setFullYear(expires.getFullYear() + 1);
      await supabase
        .from('profiles')
        .update({
          role: 'seller',
          plan: 'seller_yearly',
          plan_started_at: now.toISOString(),
          plan_expires_at: expires.toISOString(),
        })
        .eq('user_id', userId);
      break;
    case 'addon_subsidy_monthly':
      await supabase.from('profiles').update({ subsidy_addon: true }).eq('user_id', userId);
      break;
    case 'addon_boat_slots': {
      const { data: p } = await supabase
        .from('profiles')
        .select('boat_slot_extra')
        .eq('user_id', userId)
        .single();
      await supabase
        .from('profiles')
        .update({ boat_slot_extra: (p?.boat_slot_extra ?? 0) + 10 })
        .eq('user_id', userId);
      break;
    }
  }
}
