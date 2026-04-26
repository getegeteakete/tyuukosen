import Link from 'next/link';
import { MessageCircle, Zap, Bell, Eye, Heart, Anchor, Sparkles, ChevronRight } from 'lucide-react';

export const metadata = {
  title: '公式LINE - AIが船情報をお届け',
  description: '中古船売買AIサポートサイト「イイフネ🚢.com」の公式LINE。船案内AIがあなたに最適な船をお知らせ。買い手が見つかったらLINEで通知。品薄の船もいち早く。',
};

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || '#';

export default function LinePage() {
  return (
    <div className="bg-gradient-to-b from-emerald-50/40 via-sand-50 to-white min-h-screen">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-10 md:pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06C755]/10 text-[#06C755] text-xs font-medium mb-5">
          <Sparkles size={13} /> AI搭載 / 登録無料
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-ocean-900 leading-tight">
          いいフネとの出会いを、
          <br className="md:hidden" />
          <span className="text-[#06C755]">LINE</span>でお知らせ。
        </h1>
        <p className="mt-4 md:mt-5 text-sm md:text-base text-ocean-700 max-w-xl mx-auto leading-relaxed">
          公式LINEを友だち追加すると、AIがあなたの希望にあう船を見つけてプッシュ通知。
          <br className="hidden md:block" />
          出品した船の買い手成立も、品薄船の入荷情報も、いち早くお届けします。
        </p>

        {/* メイン登録ボタン */}
        <div className="mt-8 md:mt-10 flex flex-col items-center gap-3">
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 md:px-9 py-3.5 md:py-4 rounded-full bg-[#06C755] hover:bg-[#04a648] text-white font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
              <span className="font-display font-extrabold text-[#06C755] text-[10px] leading-none">LINE</span>
            </span>
            友だち追加する
            <ChevronRight size={18} />
          </a>
          <p className="text-[11px] text-ocean-700">タップで LINE アプリが開きます</p>
        </div>
      </section>

      {/* 3つのベネフィット */}
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-14">
        <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900 text-center mb-8 md:mb-10">
          公式LINEでできること
        </h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <Benefit
            icon={<Zap />}
            title="希望条件にあう船が出たら即通知"
            body="「ヤマハ 25ft 福岡 500万以下」など条件を登録すると、新しい船が出品された瞬間にAIが判断して LINE にお届け。"
          />
          <Benefit
            icon={<Bell />}
            title="買い手が見つかったらLINEに通知"
            body="出品中の船に問い合わせや見学希望が入ったら、すぐにLINEで知らせます。サイトを開きっぱなしにする必要はありません。"
          />
          <Benefit
            icon={<Eye />}
            title="品薄の船もいち早くゲット"
            body="人気のクルーザーや漁船は、出品されてから数時間で売れることも。LINE登録者にだけ先行で通知が届くので、チャンスを逃しません。"
          />
        </div>
      </section>

      {/* 使い方ステップ */}
      <section className="max-w-3xl mx-auto px-4 py-8 md:py-14">
        <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900 text-center mb-8">
          かんたん3ステップ
        </h2>
        <ol className="space-y-3">
          <Step n={1} title="友だち追加" body="上のボタンをタップしてLINE公式アカウントを友だち追加" />
          <Step n={2} title="希望条件を送信" body="トーク画面で「ヤマハ 25ft 福岡」など希望条件を送信" />
          <Step n={3} title="AIから通知が届く" body="条件にあう船が出品されたら自動でAIから通知が届きます" />
        </ol>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-10 md:py-14 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#06C755] to-[#04a648] text-white p-6 md:p-10 text-center shadow-xl">
          <Anchor className="mx-auto mb-3 opacity-90" size={28} />
          <h3 className="font-display text-lg md:text-2xl font-bold leading-tight">
            あなたにピッタリの<span className="block md:inline">船との出会いは、LINEから。</span>
          </h3>
          <p className="text-xs md:text-sm text-white/90 mt-3 max-w-md mx-auto leading-relaxed">
            登録は無料。配信停止もLINE上でいつでも可能です。
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-7 py-3 rounded-full bg-white text-[#06C755] font-bold text-sm hover:bg-emerald-50 shadow-lg"
          >
            <span className="w-6 h-6 rounded bg-[#06C755] flex items-center justify-center">
              <span className="font-display font-extrabold text-white text-[9px] leading-none">L</span>
            </span>
            いますぐ友だち追加 <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="font-display text-lg md:text-xl font-bold text-ocean-900 mb-5">よくある質問</h2>
        <div className="space-y-3">
          <Faq q="登録は無料ですか？" a="はい、完全無料です。LINE公式アカウントを友だち追加するだけでお使いいただけます。" />
          <Faq q="通知は止められますか？" a="LINEのトーク画面右上のメニューからいつでも通知をオフにできます。ブロックや友だち削除も自由です。" />
          <Faq q="サイトに会員登録は必要ですか？" a="LINEだけでも便利にお使いいただけますが、サイトに無料会員登録すると「探しています投稿」「匿名チャット」「電子契約」などが利用可能になります。" />
          <Faq q="どんな船の通知が届きますか？" a="トーク画面で送っていただいた条件（メーカー、サイズ、地域、予算など）にあう船が新規出品されたとき、AIが判定してお知らせします。" />
        </div>
      </section>
    </div>
  );
}

function Benefit({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card-soft p-5 md:p-6 bg-white">
      <div className="w-11 h-11 rounded-2xl bg-[#06C755]/10 text-[#06C755] flex items-center justify-center mb-3 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <h3 className="font-bold text-ocean-900 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-ocean-700 mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="card-soft p-4 md:p-5 flex items-start gap-4 bg-white">
      <span className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#06C755] text-white font-display font-bold flex items-center justify-center">
        {n}
      </span>
      <div>
        <p className="font-bold text-ocean-900 text-sm md:text-base">{title}</p>
        <p className="text-xs md:text-sm text-ocean-700 mt-1">{body}</p>
      </div>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card-soft p-4 md:p-5 bg-white group">
      <summary className="cursor-pointer flex items-center justify-between gap-2 list-none [&::-webkit-details-marker]:hidden">
        <span className="font-medium text-sm md:text-base text-ocean-900">{q}</span>
        <ChevronRight size={16} className="text-ocean-500 transition-transform group-open:rotate-90 shrink-0" />
      </summary>
      <p className="text-xs md:text-sm text-ocean-700 mt-3 leading-relaxed">{a}</p>
    </details>
  );
}
