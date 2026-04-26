import Link from 'next/link';
import { ChevronRight, FileSignature, Receipt, Shield, MessageCircle, Anchor, Sparkles } from 'lucide-react';

export const metadata = { title: 'ヘルプセンター' };

const TOPICS = [
  { href: '/help/contract', icon: FileSignature, title: '電子契約の使い方', desc: 'Canvas署名で契約を締結する流れ' },
  { href: '/help/subsidy', icon: Receipt, title: '補助金・助成金サポート', desc: '月額¥10,000の付帯オプション' },
  { href: '/dashboard/verify', icon: Shield, title: '身分証の確認方法', desc: '取引前の本人確認手順' },
  { href: '/pricing', icon: Anchor, title: '出品プランについて', desc: '料金・追加枠の購入方法' },
  { href: '/contact', icon: MessageCircle, title: 'お問い合わせ', desc: 'その他のご質問はこちら' },
  { href: '/dashboard', icon: Sparkles, title: 'AIアシスタント活用法', desc: '右下のFABから話しかけて自動入力' },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-3">ヘルプセンター</h1>
      <p className="text-sm text-ocean-700 mb-10">よくある質問と使い方ガイド</p>

      <div className="grid md:grid-cols-2 gap-4">
        {TOPICS.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="card-soft p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-ocean-900">{title}</p>
              <p className="text-xs text-ocean-700 mt-1">{desc}</p>
            </div>
            <ChevronRight className="text-ocean-300 mt-2" size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}
