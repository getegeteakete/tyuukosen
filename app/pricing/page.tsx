'use client';

import Link from 'next/link';
import { Check, Sparkles, Anchor, Megaphone, FileSignature, Shield, Bell, Receipt, Anchor as AnchorIcon, ChevronRight } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="bg-gradient-to-b from-ocean-50/50 to-white">
      {/* ============== Hero ============== */}
      <section className="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-8 text-center">
        <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-xs font-medium mb-4">
          <Sparkles size={12} /> シンプルで明朗な料金体系
        </p>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-ocean-900 leading-tight">
          掲載は<span className="text-coral-500">初期費用のみ</span>。<br className="md:hidden" />
          売れたら成約手数料<span className="text-coral-500">5%</span>。
        </h1>
        <p className="mt-4 md:mt-5 text-sm md:text-base text-ocean-700 max-w-xl mx-auto leading-relaxed">
          月額課金なし、追加掲載料なし、買い手は完全無料。
          <br className="hidden sm:block" />
          AI瑕疵チェック付きの安心エスクロー決済で、お互いに納得の取引を。
        </p>
      </section>

      {/* ============== 料金プラン ============== */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* 売り手プラン */}
          <div className="card-soft p-6 md:p-8 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-coral-500 text-white text-[10px] font-bold rounded-bl-lg">
              出品される方
            </div>
            <p className="text-xs text-ocean-700 mb-1">売り手プラン</p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900">年間掲載プラン</h2>

            <div className="mt-5 mb-2">
              <span className="font-display text-4xl md:text-5xl font-bold text-coral-500">¥30,000</span>
              <span className="text-sm text-ocean-700 ml-1">/ 年（税抜）</span>
            </div>
            <p className="text-xs text-ocean-700">＋ 売買成立時のみ <strong>成約手数料5%</strong> を売却額より差引</p>

            <ul className="mt-6 space-y-2.5 text-sm text-ocean-800">
              <Bullet>1年間掲載し放題（最大<strong>20艇</strong>まで）</Bullet>
              <Bullet>SNS自動投稿・AI記事生成で<strong>無料宣伝</strong></Bullet>
              <Bullet>身分証チェック・電子契約・ZOOM見学すべて利用可能</Bullet>
              <Bullet>公式LINEに話しかけるだけで<strong>船の登録完了</strong></Bullet>
              <Bullet>買い手が見つかったらLINEに即通知</Bullet>
              <Bullet>AI瑕疵チェックで安心の<strong>エスクロー決済</strong></Bullet>
            </ul>

            <Link
              href="/dashboard/boats/new"
              className="inline-flex items-center justify-center gap-2 mt-7 w-full py-3 rounded-full bg-coral-500 hover:bg-coral-600 text-white font-medium text-sm shadow"
            >
              出品を始める <ChevronRight size={14} />
            </Link>
            <p className="text-[11px] text-center text-ocean-700 mt-2">登録は無料、決済は出品時のみ</p>
          </div>

          {/* 買い手プラン */}
          <div className="card-soft p-6 md:p-8 bg-ocean-50/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-ocean-700 text-white text-[10px] font-bold rounded-bl-lg">
              買われる方
            </div>
            <p className="text-xs text-ocean-700 mb-1">買い手プラン</p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900">無料会員</h2>

            <div className="mt-5 mb-2">
              <span className="font-display text-4xl md:text-5xl font-bold text-ocean-900">¥0</span>
              <span className="text-sm text-ocean-700 ml-1">完全無料</span>
            </div>
            <p className="text-xs text-ocean-700">＋ 補助金サポートをご希望なら月額¥10,000で利用可能</p>

            <ul className="mt-6 space-y-2.5 text-sm text-ocean-800">
              <Bullet>「探しています」投稿で売り手からアプローチ</Bullet>
              <Bullet>匿名チャット・電子サインがすべて利用可能</Bullet>
              <Bullet>身分証チェック済の安心マッチング</Bullet>
              <Bullet>プレミアム船の先行情報も閲覧可</Bullet>
              <Bullet>公式LINEに条件を送るだけで<strong>AI通知</strong></Bullet>
              <Bullet>+¥10,000/月で<strong>補助金・助成金サポート</strong>追加可能</Bullet>
            </ul>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 mt-7 w-full py-3 rounded-full bg-ocean-900 hover:bg-ocean-700 text-white font-medium text-sm shadow"
            >
              無料で会員登録 <ChevronRight size={14} />
            </Link>
            <p className="text-[11px] text-center text-ocean-700 mt-2">クレジットカード登録不要</p>
          </div>
        </div>
      </section>

      {/* ============== 売買の流れ（エスクロー） ============== */}
      <section className="max-w-5xl mx-auto px-4 mt-10 md:mt-16">
        <div className="text-center mb-7 md:mb-10">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] md:text-xs font-medium mb-3">
            <Shield size={12} /> 安心のエスクロー決済
          </p>
          <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900">
            売買成立から<span className="block sm:inline">お支払いまでの流れ</span>
          </h2>
          <p className="text-xs md:text-sm text-ocean-700 mt-3 max-w-2xl mx-auto">
            買い手が支払った代金は当社が一時お預かり。AIが瑕疵チェックを行い、双方の同意後に売り手へお振込。
          </p>
        </div>

        <ol className="space-y-3 md:space-y-4">
          <Flow n={1} title="売買成立" body="チャットや見学を経て、買い手と売り手で価格・引渡条件などに合意。" />
          <Flow n={2} title="費用お預かり" body="買い手が代金を当社にお振込。当社で一時的にお預かりします（エスクロー）。" />
          <Flow n={3} title="AI瑕疵チェック" body="出品情報と実際の状態に齟齬がないか、AIが書類・写真・船検情報を照合。重要事項を整理してご報告。" />
          <Flow n={4} title="双方の同意" body="売り手・買い手の双方が引渡内容に最終同意。問題があれば返金または条件再交渉も可能。" />
          <Flow n={5} title="お支払い" body="売却額から成約手数料5%を差引いて、売り手の口座にお振込。買い手には領収書・契約書PDFをお届け。" highlight />
        </ol>

        <div className="mt-6 md:mt-8 card-soft p-4 md:p-5 bg-ocean-50/50 text-xs md:text-sm text-ocean-800">
          <p className="font-medium text-ocean-900 mb-2">💡 例: 売却額500万円の場合</p>
          <ul className="space-y-1 leading-relaxed">
            <li>・売り手の手取り: ¥4,750,000（手数料 ¥250,000差引後）</li>
            <li>・買い手の支払い: ¥5,000,000</li>
            <li>・初期掲載費 ¥30,000は別途、出品時に発生（売買が成立しない場合も返金不可）</li>
          </ul>
        </div>
      </section>

      {/* ============== その他の条件 ============== */}
      <section className="max-w-5xl mx-auto px-4 mt-10 md:mt-16 mb-12 md:mb-20">
        <div className="grid md:grid-cols-3 gap-4">
          <SubBlock icon={<Megaphone />} title="無料宣伝つき" body="AIが自動でSEO記事を作成し、SNSに投稿。掲載費にすべて含まれます。" />
          <SubBlock icon={<FileSignature />} title="電子契約システム" body="紙の契約書は不要。スマホでも署名できます。" />
          <SubBlock icon={<Bell />} title="LINE通知" body="出品中の船に動きがあったら、即LINEで通知。" />
        </div>
      </section>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={16} className="text-coral-500 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Flow({ n, title, body, highlight }: { n: number; title: string; body: string; highlight?: boolean }) {
  return (
    <li className={`card-soft p-4 md:p-5 flex items-start gap-3 md:gap-4 bg-white ${highlight ? 'ring-2 ring-coral-200' : ''}`}>
      <span className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full font-display font-bold flex items-center justify-center ${
        highlight ? 'bg-coral-500 text-white' : 'bg-ocean-100 text-ocean-900'
      }`}>
        {n}
      </span>
      <div>
        <p className="font-bold text-ocean-900 text-sm md:text-base">{title}</p>
        <p className="text-xs md:text-sm text-ocean-700 mt-1 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function SubBlock({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card-soft p-4 md:p-5 bg-white">
      <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center mb-3 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <h3 className="font-bold text-ocean-900 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-ocean-700 mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}
