'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyLinkInner({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${location.origin}/sign/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button onClick={copy} className="inline-flex items-center gap-1 text-xs text-coral-500 hover:underline">
      {copied ? <><Check size={12} /> コピー完了</> : <><Copy size={12} /> 署名URL</>}
    </button>
  );
}
