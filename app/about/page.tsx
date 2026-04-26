export const metadata = { title: '運営について' };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">運営について</h1>

      <section className="space-y-5 text-ocean-800 leading-relaxed">
        <p>
          イイフネ🚢.comは、プレジャーボート・漁船・ヨットの個人売買マーケットプレイスです。
          AIアシスタントが出品から契約までの面倒な作業をサポートし、海好きが
          安心して船の取引ができる場所を目指しています。
        </p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-10 mb-3">私たちの想い</h2>
        <p>
          中古船の売買は、これまで限られたディーラーや業者を介して行われることが多く、
          個人間で気軽に取引するのは難しい状況でした。私たちは「もっと自由に、もっと身近に」
          という想いから、中古船売買のハードルを下げる仕組みづくりに取り組んでいます。
        </p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-10 mb-3">特徴</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>AIによる出品支援・SEO記事生成・SNS自動投稿</li>
          <li>身分証チェックによる安心の本人認証</li>
          <li>サイト内完結の電子契約システム</li>
          <li>ZOOM見学予約による遠隔内見対応</li>
          <li>掲載料のみのシンプルな料金体系（仲介手数料0円）</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-10 mb-3">運営者情報</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-ocean-700">サービス名</dt><dd>イイフネ🚢.com</dd>
          <dt className="text-ocean-700">運営開始</dt><dd>2026年</dd>
          <dt className="text-ocean-700">お問い合わせ</dt><dd><a href="/contact" className="text-coral-500 underline">お問い合わせフォーム</a></dd>
        </dl>
      </section>
    </div>
  );
}
