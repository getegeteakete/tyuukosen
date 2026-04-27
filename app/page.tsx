import Link from 'next/link';
import { Search, Anchor, Wrench, FileSignature, MessageCircle, Sparkles, AlertCircle, Shield, Star, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BoatCard } from '@/components/marketplace/boat-card';
import { LineCtaHero } from '@/components/marketplace/line-cta';

export const revalidate = 300;

async function fetchFeatured() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('boats')
      .select('id,title,brand,year,length_ft,price,location_pref,cover_image_url,is_premium')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(8);
    return { boats: data ?? [], configured: true as const };
  } catch (e) {
    return { boats: [] as any[], configured: false as const };
  }
}

export default async function HomePage() {
  const { boats: featured, configured } = await fetchFeatured();

  return (
    <>
      {!configured && <SetupNotice />}

      {/* ============== Hero ============== */}
      <section className="relative overflow-hidden isolate min-h-[560px] md:min-h-[680px]">
        {/* 背景: ポスター画像 + 動画 */}
        <div
          className="absolute inset-0 z-0 bg-ocean-900 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero/hero-poster.jpg)' }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            poster="/hero/hero-poster.jpg"
            autoPlay muted loop playsInline preload="auto" aria-hidden="true"
          >
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/70 via-ocean-900/45 to-sand-50/95" />
        </div>

        {/* 下端の波 */}
        <svg
          className="absolute bottom-0 left-0 w-full text-sand-50 z-[5] pointer-events-none"
          viewBox="0 0 1440 80" preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>

        {/* コンテンツ */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-32 md:pt-24 md:pb-36 text-center">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-coral-600 text-[11px] md:text-xs font-medium mb-4 shadow-sm">
            <Sparkles size={12} /> AIが出品も検索も全部サポート
          </p>
          <h1 className="font-display text-[28px] leading-[1.25] sm:text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            海まで、もう一歩。<br />
            <span className="text-coral-300">中古船</span>を、もっと自由に。
          </h1>
          <p className="mt-4 md:mt-5 text-white/95 max-w-xl mx-auto text-[13px] md:text-base px-2 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            プレジャーボート・漁船・ヨットの個人売買マーケット。
            <br className="hidden sm:block" />
            AIが登録も買い手探しも契約書もまるっとサポート。
          </p>

          {/* 検索バー */}
          <form
            action="/boats" method="GET"
            className="mt-6 md:mt-8 max-w-2xl mx-auto flex bg-white rounded-full shadow-[0_12px_36px_-8px_rgba(14,58,92,0.5)]"
          >
            <div className="flex-1 flex items-center pl-4">
              <Search className="text-ocean-500 shrink-0" size={18} />
              <input
                type="text" name="q"
                placeholder="船名・メーカー・地域で探す"
                className="flex-1 px-3 py-3.5 bg-transparent outline-none text-sm w-full min-w-0"
              />
            </div>
            <button
              type="submit"
              className="m-1.5 px-5 md:px-6 rounded-full bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium"
            >
              検索
            </button>
          </form>

          {/* 人気タグ */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] md:text-xs text-white/95">
            {['ヤマハ', 'トヨタ', '20ft以下', '500万円以下', '福岡', '沖縄'].map((tag) => (
              <Link
                key={tag}
                href={`/boats?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-full bg-white/95 backdrop-blur text-ocean-800 hover:bg-coral-50 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== カテゴリ（モバイル横スクロール） ============== */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          <CategoryTile href="/boats?type=pleasure" icon={<Anchor />} label="プレジャーボート" sub="クルーザー / 釣り船" />
          <CategoryTile href="/boats?type=fishing" icon={<Anchor />} label="漁船" sub="商業漁業向け" />
          <CategoryTile href="/parts" icon={<Wrench />} label="パーツ" sub="エンジン / GPS 等" />
          <CategoryTile href="/wanted" icon={<MessageCircle />} label="探しています" sub="買い手側の投稿" />
        </div>
      </section>

      {/* ============== 注目の出品 ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900 heading-wave">
              注目の出品
            </h2>
            <p className="text-xs md:text-sm text-ocean-700 mt-3">新着・プレミアム掲載をピックアップ</p>
          </div>
          <Link href="/boats" className="text-xs md:text-sm text-coral-500 hover:text-coral-600 font-medium shrink-0 ml-2">
            すべて見る →
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {featured.map((b) => (
              <BoatCard key={b.id} boat={b} />
            ))}
          </div>
        ) : (
          <EmptyFeatured />
        )}
      </section>

      {/* ============== 仕組み（3ステップ） ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-16 md:mt-24">
        <div className="text-center mb-8 md:mb-10">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-[11px] md:text-xs font-medium mb-3">
            <Zap size={12} /> たった3ステップ
          </p>
          <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900">
            AIが面倒をぜんぶ引き受けます
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          <StepCard n="01" title="話すだけで登録完了" body="AIに「2018年式のヤマハで…」と話せば項目を自動入力。写真アップだけで出品OK。" icon={<Sparkles />} />
          <StepCard n="02" title="勝手にSNS&記事化" body="出品後、AIが紹介文・SEO記事・SNS投稿を自動作成。寝てる間も宣伝されます。" icon={<TrendingUp />} />
          <StepCard n="03" title="商談はサイト内完結" body="匿名チャット → ZOOM見学 → 電子契約まで一気通貫。スマホで全部できる。" icon={<FileSignature />} />
        </div>
      </section>

      {/* ============== LINE誘導 ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-16">
        <LineCtaHero />
      </section>

      {/* ============== 売買メリット ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-16">
        <div className="text-center mb-7 md:mb-10">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-[11px] md:text-xs font-medium mb-3">
            <Star size={12} /> 安心して使える6つの理由
          </p>
          <h2 className="font-display text-xl md:text-2xl font-bold text-ocean-900">
            イイフネ🚢.comが選ばれる<span className="block sm:inline">売買メリット</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Merit emoji="📝" title="楽々電子契約書付き" body="紙の契約書は不要。スマホやPCから手書き署名できる電子契約システムを標準装備。" />
          <Merit emoji="🚫" title="仲介手数料なし" body="売買代金から手数料は一切引きません。売主の手取り、買主の支払いがそのまま。" />
          <Merit emoji="💰" title="掲載費用のみ" body="月額3,000円の出品プランだけ。売れた・売れない関わらず、追加料金は発生しません。" />
          <Merit emoji="🚢" title="該当船が出たらLINE通知" body="登録後、公式LINEに条件を送れば、希望の船が出品されると即座にAIが通知。" />
          <Merit emoji="💬" title="船登録もLINEで完結" body="公式LINEに「2018年式のヤマハで…」と話しかけるだけで、AIが出品ページを作成。" />
          <Merit emoji="🎉" title="買い手成立もLINE通知" body="出品した船に問い合わせや見学希望が入ったら、すぐにLINEで知らせます。" />
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <Link
            href="/line"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#06C755] hover:bg-[#04a648] text-white font-bold text-sm shadow"
          >
            <span className="w-5 h-5 rounded bg-white flex items-center justify-center">
              <span className="font-display font-extrabold text-[#06C755] text-[8px] leading-none">L</span>
            </span>
            まずはLINE登録から <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* ============== 機能ハイライト ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-16 md:mt-24 grid md:grid-cols-2 gap-4 md:gap-6">
        <FeatureBlock
          title="買い手も無料で使える"
          body="会員登録は完全無料。「探しています」投稿、匿名チャット、電子サイン、プレミアム情報の閲覧まで。月額¥10,000のオプションで補助金・助成金サポートも追加可能。"
          cta={{ label: '無料で会員登録', href: '/auth/login' }}
          tone="ocean"
        />
        <FeatureBlock
          title="売り手は最大10隻まで掲載"
          body="月額¥3,000 / 年額¥30,000で5隻まで。+¥10,000で10隻ずつ追加可能。電子契約・身分証チェック・ZOOM見学予約すべて込み。"
          cta={{ label: '出品プランを見る', href: '/pricing' }}
          tone="coral"
        />
      </section>

      {/* ============== 信頼バー ============== */}
      <section className="max-w-6xl mx-auto px-4 mt-16 md:mt-24 mb-8">
        <div className="rounded-2xl bg-ocean-900 text-white p-6 md:p-12 grid grid-cols-3 gap-3 md:gap-6 text-center">
          <Stat n="100%" label="身分証チェック済み" />
          <Stat n="48h" label="平均で初回チャット" />
          <Stat n="0円" label="買い手の利用料金" />
        </div>
      </section>
    </>
  );
}

function CategoryTile({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link href={href} className="card-soft p-3 md:p-4 flex items-center gap-2.5 md:gap-3">
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-medium text-ocean-900 leading-tight">{label}</p>
        <p className="text-[10px] md:text-[11px] text-ocean-700 mt-0.5 truncate">{sub}</p>
      </div>
    </Link>
  );
}

function Merit({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="card-soft p-4 md:p-5 bg-white">
      <div className="text-2xl md:text-3xl mb-2">{emoji}</div>
      <h3 className="font-bold text-ocean-900 text-[13px] md:text-base leading-tight">{title}</h3>
      <p className="text-[11px] md:text-sm text-ocean-700 mt-1.5 md:mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function StepCard({ n, title, body, icon }: { n: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="card-soft p-5 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-coral-500 text-lg md:text-xl font-bold">{n}</span>
        <span className="w-9 h-9 rounded-full bg-ocean-50 text-ocean-700 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
      </div>
      <h3 className="font-medium text-ocean-900 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-ocean-700 mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function FeatureBlock({ title, body, cta, tone }: { title: string; body: string; cta: { label: string; href: string }; tone: 'ocean' | 'coral' }) {
  const isCoral = tone === 'coral';
  return (
    <div className={`rounded-2xl p-5 md:p-7 ${isCoral ? 'bg-coral-50 border border-coral-100' : 'bg-ocean-50 border border-ocean-100'}`}>
      <h3 className={`font-display text-lg md:text-xl font-bold ${isCoral ? 'text-coral-700' : 'text-ocean-900'}`}>{title}</h3>
      <p className="text-xs md:text-sm text-ocean-800 mt-2.5 md:mt-3 leading-relaxed">{body}</p>
      <Link
        href={cta.href}
        className={`inline-flex items-center gap-1 mt-4 md:mt-5 px-5 py-2.5 rounded-full text-xs md:text-sm font-medium ${
          isCoral ? 'bg-coral-500 text-white hover:bg-coral-600' : 'bg-ocean-900 text-white hover:bg-ocean-700'
        }`}
      >
        {cta.label} <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl md:text-4xl font-bold text-coral-300">{n}</div>
      <div className="text-[11px] md:text-sm text-ocean-100 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function EmptyFeatured() {
  return (
    <div className="text-center py-12 md:py-16 border border-dashed border-ocean-200 rounded-2xl text-ocean-700">
      <Anchor className="mx-auto mb-3" />
      <p className="text-xs md:text-sm">まだ出品がありません。最初の出品者になりませんか？</p>
      <Link href="/dashboard/boats/new" className="inline-block mt-4 px-5 py-2 rounded-full bg-coral-500 text-white text-xs md:text-sm">
        出品する
      </Link>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3 text-sm">
        <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={18} />
        <div>
          <p className="font-medium text-amber-900">セットアップ未完了</p>
          <p className="text-amber-800 text-xs mt-0.5">
            Supabaseの環境変数が未設定のため、データベース接続なしのプレビュー表示です。
          </p>
        </div>
      </div>
    </div>
  );
}
