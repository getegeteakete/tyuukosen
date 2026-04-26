export const metadata = { title: '補助金・助成金サポート' };

export default function SubsidyHelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">補助金・助成金サポート</h1>
      <div className="space-y-5 text-ocean-800 leading-relaxed">
        <p>
          月額¥10,000の付帯オプションで、中古船購入・所有に関連する補助金・助成金の
          申請を専門スタッフがサポートします。
        </p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-10">対象となる主な制度（例）</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>地方自治体の漁業就業支援金</li>
          <li>マリンレジャー振興補助金</li>
          <li>船舶リサイクル促進助成</li>
          <li>業務用船舶の設備投資減税</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-10">サポート内容</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>制度の検索・該当性判定</li>
          <li>申請書類の作成支援</li>
          <li>提出先・スケジュールのアドバイス</li>
          <li>追加書類対応</li>
        </ul>

        <p className="mt-8 text-xs text-ocean-700">
          ※ 制度は地域・時期により異なります。受給を保証するものではありません。
        </p>

        <a href="/pricing" className="inline-block mt-6 px-6 py-2.5 rounded-full bg-coral-500 text-white text-sm font-medium">
          オプションを追加する
        </a>
      </div>
    </div>
  );
}
