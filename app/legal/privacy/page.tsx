export const metadata = { title: 'プライバシーポリシー' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">プライバシーポリシー</h1>
      <div className="space-y-5 text-ocean-800 leading-relaxed text-sm">
        <p>
          イイフネ🚢.com（以下「当サービス」）は、利用者の個人情報を以下のとおり取り扱います。
        </p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">1. 取得する個人情報</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>氏名、メールアドレス、電話番号</li>
          <li>身分証明書の画像（取引時の本人確認のため）</li>
          <li>支払い情報（決済代行会社経由）</li>
          <li>サービス利用履歴・アクセスログ</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">2. 利用目的</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>本サービスの提供および本人確認</li>
          <li>取引マッチング・コミュニケーション機能の提供</li>
          <li>不正利用の防止</li>
          <li>サービス改善のための分析</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">3. 第三者提供</h2>
        <p>法令に基づく場合を除き、利用者の同意なく第三者に個人情報を提供することはありません。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">4. データの保管</h2>
        <p>個人情報は適切なセキュリティ対策のもと、Supabase等のクラウドサービスで暗号化して保管します。
        身分証画像は管理者のみがアクセス可能な領域に保管します。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">5. 開示・訂正・削除</h2>
        <p>利用者からの開示・訂正・削除請求にはお問い合わせフォームから対応します。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">6. Cookie等の利用</h2>
        <p>サービスの認証・利用状況の解析のためにCookie等を利用しています。</p>

        <p className="text-xs text-ocean-700 mt-12">最終更新: 2026年4月</p>
      </div>
    </div>
  );
}
