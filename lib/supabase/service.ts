import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function isServiceConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * RLSをバイパスするService Roleクライアント。
 * Cronジョブ・Webhook・AIエージェントなど、認証なしでDBにアクセスする場面でのみ使用。
 * クライアント側に絶対送らないこと。
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Supabase service client is not configured.');
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
