import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ocean-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-display font-bold text-ocean-900 mb-3">中古船マーケット</h3>
          <p className="text-ocean-700 text-xs leading-relaxed">
            AIアシストで簡単に中古船・パーツを売買できる、海好きのためのマーケットプレイスです。
          </p>
        </div>
        <div>
          <h4 className="font-medium text-ocean-900 mb-3">使う</h4>
          <ul className="space-y-2 text-ocean-700">
            <li><Link href="/boats">中古船を探す</Link></li>
            <li><Link href="/parts">パーツ</Link></li>
            <li><Link href="/wanted">探しています投稿</Link></li>
            <li><Link href="/pricing">出品プラン</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-ocean-900 mb-3">会社</h4>
          <ul className="space-y-2 text-ocean-700">
            <li><Link href="/about">運営について</Link></li>
            <li><Link href="/contact">お問い合わせ</Link></li>
            <li><Link href="/legal/terms">利用規約</Link></li>
            <li><Link href="/legal/privacy">プライバシー</Link></li>
            <li><Link href="/legal/tokutei">特定商取引法</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-ocean-900 mb-3">サポート</h4>
          <ul className="space-y-2 text-ocean-700">
            <li><Link href="/help">ヘルプセンター</Link></li>
            <li><Link href="/help/subsidy">補助金サポート</Link></li>
            <li><Link href="/help/contract">電子契約の使い方</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ocean-100 py-4 text-center text-xs text-ocean-700">
        © {new Date().getFullYear()} 中古船マーケット
      </div>
    </footer>
  );
}
