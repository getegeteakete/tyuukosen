export const metadata = { title: '特定商取引法に基づく表記' };

export default function TokuteiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">特定商取引法に基づく表記</h1>

      <table className="w-full text-sm">
        <tbody className="divide-y divide-ocean-100">
          {[
            ['販売事業者', 'イイフネ🚢.com運営事務局'],
            ['代表者', '（運営者名）'],
            ['所在地', '（住所）※請求があれば遅滞なく開示'],
            ['電話番号', '（電話番号）※請求があれば遅滞なく開示'],
            ['メール', 'お問い合わせフォームをご利用ください'],
            ['販売価格', '出品プラン: ¥30,000/年（税抜・最大20艇）、補助金サポート月額¥10,000、成約手数料5%（売買成立時のみ売り手から徴収）'],
            ['追加手数料等', '通信費はお客様のご負担。売買代金は当社で一時お預かり（エスクロー）し、双方同意後にお支払いします'],
            ['お支払い方法', 'クレジットカード（UnivaPay）'],
            ['お支払い時期', '出品プラン: 契約時(年額一括)、補助金サポート: 毎月、成約手数料: 売買成立時に売却額より自動差引'],
            ['サービス提供時期', '決済完了後、即時'],
            ['返品・キャンセル', 'デジタルサービスの性質上、決済後の返金は原則対応しておりません'],
            ['動作環境', 'モダンブラウザの最新版'],
          ].map(([k, v]) => (
            <tr key={k}>
              <th className="text-left px-4 py-3 text-ocean-700 font-medium w-44 align-top">{k}</th>
              <td className="px-4 py-3 text-ocean-900">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-ocean-700 mt-8">最終更新: 2026年4月</p>
    </div>
  );
}
