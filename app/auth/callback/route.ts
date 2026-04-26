import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const redirect = url.searchParams.get('redirect') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // プロフィールが未作成なら自動作成
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          email: user.email,
          display_name: user.email?.split('@')[0],
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );
    }
  }

  return NextResponse.redirect(new URL(redirect, url.origin));
}
