import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { SignClient } from './sign-client';
import { sanitizeHtml } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const svc = createServiceClient();

  const { data: contract } = await svc
    .from('contracts')
    .select('*')
    .eq('sign_token', token)
    .maybeSingle();

  if (!contract) notFound();

  if (contract.status === 'signed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="font-display text-xl font-bold text-ocean-900">この契約書はすでに署名済みです</h1>
          <p className="text-sm text-ocean-700 mt-2">ご署名ありがとうございました。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ocean-900">{contract.contract_title}</h1>
      <p className="text-xs text-ocean-700 mt-2">
        この契約書の内容を確認のうえ、下部の枠に手書きで署名してください。
      </p>

      <article
        className="card-soft p-6 mt-6 prose prose-sm max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(contract.contract_content ?? '') }}
      />

      <SignClient token={token} contractId={contract.id} />
    </div>
  );
}
