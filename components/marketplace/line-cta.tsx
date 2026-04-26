import Link from 'next/link';
import { MessageCircle, Bell, Zap, Sparkles, ChevronRight } from 'lucide-react';

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || '/line';

/**
 * 大きめのLINE誘導バナー（ホームの目立つ位置用）
 */
export function LineCtaHero() {
  return (
    <Link
      href={LINE_URL}
      className="block rounded-2xl bg-gradient-to-br from-[#06C755] to-[#04a648] text-white p-5 md:p-7 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* LINEロゴ風 */}
        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center shadow-inner">
          <span className="font-display font-extrabold text-[#06C755] text-base md:text-lg leading-none tracking-tight">LINE</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium bg-white/25 px-2 py-0.5 rounded-full mb-2">
            <Sparkles size={11} /> AI搭載・登録無料
          </p>
          <h3 className="font-display font-bold text-base md:text-xl leading-tight">
            <span className="block md:inline">いいフネとの出会いを、</span>
            <span className="block md:inline">LINEでお知らせ。</span>
          </h3>
          <ul className="mt-3 space-y-1 text-[12px] md:text-sm text-white/95">
            <li className="flex items-start gap-1.5"><Zap size={13} className="mt-0.5 shrink-0" /> 希望条件にあう船が出たら即通知</li>
            <li className="flex items-start gap-1.5"><Bell size={13} className="mt-0.5 shrink-0" /> 出品中の船に買い手がついたら通知</li>
            <li className="flex items-start gap-1.5"><MessageCircle size={13} className="mt-0.5 shrink-0" /> 品薄の船もいち早くゲット</li>
          </ul>
          <span className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-full bg-white text-[#06C755] text-xs md:text-sm font-bold">
            友だち追加する <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * 小さめバナー（船一覧・詳細ページ用）
 */
export function LineCtaCompact() {
  return (
    <Link
      href={LINE_URL}
      className="flex items-center gap-3 rounded-2xl bg-[#06C755] text-white px-4 py-3 shadow hover:shadow-md transition-shadow"
    >
      <div className="shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center">
        <span className="font-display font-extrabold text-[#06C755] text-xs leading-none">LINE</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs md:text-sm leading-tight">条件にあう船が出たら即通知</p>
        <p className="text-[10px] md:text-xs text-white/90 mt-0.5">公式LINEで先行情報をゲット</p>
      </div>
      <ChevronRight size={18} className="shrink-0" />
    </Link>
  );
}
