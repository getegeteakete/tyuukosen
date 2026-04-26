export const metadata = { title: '電子契約の使い方' };

export default function ContractHelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">電子契約の使い方</h1>
      <div className="space-y-6 text-ocean-800 leading-relaxed">
        <p>
          イイフネ🚢.comの電子契約は、サイト内で完結する手書き署名方式です。
          紙の契約書を郵送する手間がなく、スマートフォンからでも署名できます。
        </p>

        <ol className="list-decimal pl-5 space-y-4 text-sm">
          <li>
            <strong className="text-ocean-900">売主が契約書を作成</strong>
            <p className="mt-1 text-ocean-700">
              マイページ → 契約書一覧 → 「契約書を作成」ボタンから、
              ひな形を選んで内容を編集します。買主のメールアドレスを指定して保存。
            </p>
          </li>
          <li>
            <strong className="text-ocean-900">署名URLを買主に送付</strong>
            <p className="mt-1 text-ocean-700">
              発行された署名URLを買主にチャットやメールで送信します。
              買主はログイン不要でURLからアクセス可能。
            </p>
          </li>
          <li>
            <strong className="text-ocean-900">買主が手書き署名</strong>
            <p className="mt-1 text-ocean-700">
              買主は契約内容を確認し、Canvas枠にマウスまたは指で署名します。
            </p>
          </li>
          <li>
            <strong className="text-ocean-900">契約締結完了</strong>
            <p className="mt-1 text-ocean-700">
              署名された契約書はマイページから確認できます。
              署名済みPDFのダウンロードも可能。
            </p>
          </li>
        </ol>

        <div className="card-soft p-5 mt-8 bg-ocean-50/40">
          <h3 className="font-medium text-ocean-900 mb-2">📌 注意事項</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ocean-800">
            <li>取引前に身分証チェックを完了させることを推奨します</li>
            <li>契約内容は双方で確認のうえご署名ください</li>
            <li>署名後の変更はできません（再発行をご利用ください）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
