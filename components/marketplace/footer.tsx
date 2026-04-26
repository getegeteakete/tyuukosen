import Link from 'next/link';

const SECTIONS = [
  {
    title: '使う',
    links: [
      { href: '/boats', label: '中古船を探す' },
      { href: '/parts', label: 'パーツ' },
      { href: '/wanted', label: '探しています投稿' },
      { href: '/pricing', label: '出品プラン' },
    ],
  },
  {
    title: '会社',
    links: [
      { href: '/about', label: '運営について' },
      { href: '/contact', label: 'お問い合わせ' },
      { href: '/legal/terms', label: '利用規約' },
      { href: '/legal/privacy', label: 'プライバシー' },
      { href: '/legal/tokutei', label: '特定商取引法' },
    ],
  },
  {
    title: 'サポート',
    links: [
      { href: '/line', label: '公式LINE' },
      { href: '/help', label: 'ヘルプセンター' },
      { href: '/help/subsidy', label: '補助金サポート' },
      { href: '/help/contract', label: '電子契約の使い方' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 md:mt-20 border-t border-ocean-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" width="28" height="28" className="w-7 h-7" />
              <h3 className="font-display font-bold text-ocean-900">
                イイフネ<span className="text-coral-500">🚢</span>.com
              </h3>
            </div>
            <p className="text-ocean-700 text-xs leading-relaxed">
              中古船売買AIサポートサイト。AIアシストで簡単に中古船・パーツを売買できる、海好きのためのマーケットプレイス。
            </p>
          </div>
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h4 className="font-medium text-ocean-900 mb-3 text-xs md:text-sm">{sec.title}</h4>
              <ul className="space-y-2 text-ocean-700 text-xs md:text-sm">
                {sec.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-coral-500 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-ocean-100 py-4 text-center text-[11px] md:text-xs text-ocean-700">
        © {new Date().getFullYear()} イイフネ🚢.com - 中古船売買AIサポートサイト
      </div>
    </footer>
  );
}
