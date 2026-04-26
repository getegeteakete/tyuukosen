'use client';

import { useState } from 'react';
import { SignatureCanvas } from '@/components/contract/signature-canvas';

export function SignClient({ token, contractId }: { token: string; contractId: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(dataUrl: string) {
    setBusy(true); setErr(null);
    const res = await fetch('/api/contract/sign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, contractId, signature: dataUrl }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? '保存に失敗しました');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card-soft p-8 mt-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="font-display text-xl font-bold text-ocean-900">署名が完了しました</h2>
        <p className="text-sm text-ocean-700 mt-2">控えはご登録のメールにお送りします。</p>
      </div>
    );
  }

  return (
    <div className="card-soft p-6 mt-6">
      <h2 className="font-medium text-ocean-900 mb-3">手書き署名</h2>
      <p className="text-xs text-ocean-700 mb-4">
        マウスまたは指で下の枠内に署名してください。
      </p>
      <SignatureCanvas onSave={save} disabled={busy} />
      {err && <p className="text-xs text-coral-500 mt-2">{err}</p>}
    </div>
  );
}
