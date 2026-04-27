export const metadata = { title: '利用規約' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-sm max-w-none">
      <h1 className="font-display text-3xl font-bold text-ocean-900 heading-wave mb-8">利用規約</h1>
      <div className="space-y-6 text-ocean-800 leading-relaxed text-sm">
        <p>
          この利用規約（以下「本規約」といいます）は、イイフネ🚢.com（以下「当サービス」といいます）が
          提供する中古船売買マーケットプレイスサービスの利用条件を定めるものです。
        </p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第1条（適用）</h2>
        <p>本規約は、利用者と当サービスとの間の本サービス利用に関わる一切の関係に適用されます。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第2条（利用登録）</h2>
        <p>本サービスにおいて、登録希望者が当サービスの定める方法によって利用登録を申請し、
        当サービスがこれを承認することによって、利用登録が完了するものとします。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第3条（出品プラン・料金）</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>売り手向け年間掲載プラン: ¥30,000/年（税抜・最大20艇まで掲載可能）</li>
          <li>成約手数料: 売買成立時のみ、売却額の5%を売り手から徴収</li>
          <li>補助金・助成金サポートオプション: 月額¥10,000</li>
          <li>買い手の利用: 完全無料</li>
          <li>初期掲載費は売買が成立しない場合も返金対象外とします</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第3条の2（エスクロー決済）</h2>
        <p>売買代金は当社が一時お預かりします。AIによる瑕疵チェックを経て、売り手・買い手の双方が引渡内容に同意した後、売却額から成約手数料5%を差引き、売り手指定の口座にお振込いたします。AI瑕疵チェックでお互いに合意できない場合は、双方協議のうえ返金または条件再交渉を行います。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第4条（禁止事項）</h2>
        <p>利用者は、以下の行為をしてはなりません:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>虚偽の出品情報の掲載</li>
          <li>他の利用者への嫌がらせ、迷惑行為</li>
          <li>当サービスの運営を妨害する行為</li>
          <li>反社会的勢力に関わる行為</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第5条（売買契約）</h2>
        <p>当サービスは出品者と購入者の取引の場を提供するのみであり、売買契約の当事者にはなりません。
        取引に関する一切の責任は当事者間で負うものとします。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第6条（免責事項）</h2>
        <p>当サービスは、出品物の品質・安全性・適法性について保証するものではありません。
        利用者間のトラブルについて、当サービスは一切の責任を負いません。</p>

        <h2 className="font-display text-xl font-bold text-ocean-900 mt-8">第7条（規約の変更）</h2>
        <p>当サービスは必要と判断した場合、本規約を変更することができるものとします。</p>

        <p className="text-xs text-ocean-700 mt-12">最終更新: 2026年4月</p>
      </div>
    </div>
  );
}
