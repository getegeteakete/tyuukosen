'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    UnivapayCheckout: any;
  }
}

const PLANS = [
  {
    id: 'seller_yearly',
    name: '年額プラン',
    price: 30000,
    cycle: '1年間有効',
    productType: 'subscription_seller_yearly',
    pop: true,
    perks: [
      '船を5隻まで掲載',
      '電子契約・身分証チェック',
      '匿名チャット・ZOOM見学',
      'AI登録支援・SEO記事自動生成',
      'SNS自動告知',
    ],
  },
  {
    id: 'seller_monthly',
    name: '月額プラン',
    price: 3000,
    cycle: '毎月課金',
    productType: 'subscription_seller_monthly',
    perks: [
      '船を5隻まで掲載',
      '電子契約・身分証チェック',
      '匿名チャット・ZOOM見学',
      'AI登録支援・SEO記事自動生成',
      'SNS自動告知',
    ],
  },
];

const ADDONS = [
  { id: 'addon_boat_slots', label: '+10隻 追加掲載枠', price: 10000, productType: 'addon_boat_slots' },
  { id: 'addon_subsidy', label: '補助金・助成金サポート（月額）', price: 10000, productType: 'addon_subsidy_monthly' },
];

export default function PricingPage() {
  const [busy, setBusy] = useState<string | null>(null);

  function startCheckout(plan: { price: number; productType: string; id: string }) {
    setBusy(plan.id);
    if (typeof window === 'undefined' || !window.UnivapayCheckout) {
      alert('決済システムを読み込み中です。少しお待ちください。');
      setBusy(null);
      return;
    }
    const checkout = window.UnivapayCheckout.create({
      appId: process.env.NEXT_PUBLIC_UNIVAPAY_APP_ID,
      checkout: 'payment',
      amount: plan.price,
      currency: 'jpy',
      cvvAuthorize: true,
      metadata: { product_type: plan.productType },
      onSuccess: () => {
        window.location.href = '/dashboard?upgraded=1';
      },
      onError: () => setBusy(null),
      onCancel: () => setBusy(null),
    });
    checkout.open();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-xs font-medium mb-3">
          <Sparkles size={14} /> 売り手向けプラン
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ocean-900">
          掲載料だけで、しっかり売れる。
        </h1>
        <p className="mt-3 text-sm text-ocean-700">
          仲介手数料0円。月額¥3,000または年額¥30,000で、最大5隻まで出品可能。
        </p>
      </div>

      {/* メインプラン */}
      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-2xl bg-white border-2 p-7 ${p.pop ? 'border-coral-400' : 'border-ocean-100'}`}
          >
            {p.pop && (
              <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-coral-500 text-white text-xs font-medium">
                おすすめ（17%お得）
              </span>
            )}
            <h2 className="font-display text-xl font-bold text-ocean-900">{p.name}</h2>
            <p className="text-xs text-ocean-700 mt-1">{p.cycle}</p>
            <p className="font-display text-4xl font-bold text-coral-500 mt-4">
              ¥{p.price.toLocaleString()}
              <span className="text-sm text-ocean-700 font-normal ml-1">（税込）</span>
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ocean-800">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <Check className="text-coral-500 mt-0.5 shrink-0" size={16} />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(p)}
              disabled={busy !== null}
              className="mt-6 w-full py-3 rounded-full bg-ocean-900 hover:bg-ocean-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {busy === p.id ? '決済画面を準備中...' : 'このプランで始める'}
            </button>
          </div>
        ))}
      </div>

      {/* オプション */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-bold text-ocean-900 heading-wave mb-6">
          オプション
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ADDONS.map((a) => (
            <div key={a.id} className="card-soft p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-ocean-900">{a.label}</p>
                <p className="text-coral-500 font-bold mt-1">¥{a.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => startCheckout(a)}
                disabled={busy !== null}
                className="px-4 py-2 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium disabled:opacity-50"
              >
                追加する
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 買い手側の説明 */}
      <div className="mt-14 rounded-2xl bg-ocean-50 border border-ocean-100 p-7 md:p-9 text-center">
        <h2 className="font-display text-xl font-bold text-ocean-900">買い手は登録無料</h2>
        <p className="text-sm text-ocean-700 mt-3 max-w-xl mx-auto">
          中古船を探す側は完全無料で全機能を利用できます。「探しています」投稿、匿名チャット、電子サイン、プレミアム情報の閲覧まで対応。
          補助金サポートをご希望の方は月額¥10,000のオプションをどうぞ。
        </p>
        <a href="/auth/signup" className="inline-block mt-5 px-6 py-2.5 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium">
          無料で会員登録
        </a>
      </div>
    </div>
  );
}
