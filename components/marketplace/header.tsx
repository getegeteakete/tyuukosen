'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Search, User, Plus, Anchor, Wrench, MessageCircle, Tag, FileSignature, HelpCircle, LogIn } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/boats', label: '中古船を探す', icon: Anchor },
  { href: '/parts', label: 'パーツ', icon: Wrench },
  { href: '/wanted', label: '探しています', icon: MessageCircle },
  { href: '/pricing', label: '出品プラン', icon: Tag },
  { href: '/line', label: '公式LINE', icon: MessageCircle, accent: true },
];

const MORE_ITEMS = [
  { href: '/dashboard', label: 'マイページ', icon: User },
  { href: '/contracts', label: '電子契約', icon: FileSignature },
  { href: '/help', label: 'ヘルプ', icon: HelpCircle },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ルート変更でメニュー閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC キーで閉じる、開いてる時はbodyスクロールロック
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ocean-100">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center gap-3 md:gap-6">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width="32" height="32" className="w-8 h-8" />
            <span className="font-display font-bold text-base md:text-lg text-ocean-900 leading-none tracking-tight">
              イイフネ<span className="text-coral-500">🚢</span>.com
            </span>
          </Link>

          {/* PC: 横並びナビ */}
          <nav className="hidden md:flex items-center gap-5 text-sm text-ocean-800 ml-2">
            {NAV_ITEMS.filter(n => !n.accent).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-coral-500 transition-colors ${
                  pathname?.startsWith(href) ? 'text-coral-500 font-medium' : ''
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* PC: 検索/マイページ */}
          <Link
            href="/boats"
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ocean-50 text-ocean-800 hover:bg-ocean-100 text-sm"
          >
            <Search size={16} /> 検索
          </Link>
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-ocean-50 text-sm text-ocean-800"
          >
            <User size={16} /> マイページ
          </Link>

          {/* 出品ボタン: 全画面で表示 */}
          <Link
            href="/dashboard/boats/new"
            className="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-coral-500 text-white hover:bg-coral-600 text-xs md:text-sm font-medium shadow-sm"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
            出品
          </Link>

          {/* スマホ: バーガーボタン */}
          <button
            onClick={() => setOpen(true)}
            aria-label="メニューを開く"
            className="md:hidden w-10 h-10 -mr-2 rounded-full hover:bg-ocean-50 flex items-center justify-center text-ocean-900"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* モバイルメニュー（オーバーレイ + スライドイン） */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        {/* 暗い背景 */}
        <button
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-ocean-900/60"
        />
        {/* メニュー本体 */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-200 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* メニューヘッダー */}
          <div className="px-5 py-4 border-b border-ocean-100 flex items-center justify-between">
            <p className="font-display font-bold text-ocean-900">メニュー</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className="w-9 h-9 rounded-full hover:bg-ocean-50 flex items-center justify-center text-ocean-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* 検索バー */}
          <form action="/boats" method="GET" className="p-4 border-b border-ocean-100">
            <div className="flex items-center bg-ocean-50 rounded-full">
              <Search className="text-ocean-500 ml-4" size={16} />
              <input
                name="q"
                type="text"
                placeholder="船・パーツを検索"
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
              />
            </div>
          </form>

          {/* ナビゲーション */}
          <nav className="flex-1 overflow-y-auto py-2">
            <p className="px-5 pt-3 pb-1 text-[10px] font-medium text-ocean-700 uppercase tracking-wider">
              探す・売る
            </p>
            {NAV_ITEMS.map(({ href, label, icon: Icon, accent }) => {
              const active = pathname?.startsWith(href);
              if (accent) {
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-colors bg-[#06C755]/10 text-[#06C755] font-medium hover:bg-[#06C755]/15"
                  >
                    <Icon size={18} className="text-[#06C755]" />
                    {label}
                    <span className="ml-auto text-[10px] bg-[#06C755] text-white px-1.5 py-0.5 rounded-full">登録無料</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                    active ? 'bg-coral-50 text-coral-600 font-medium' : 'text-ocean-900 hover:bg-ocean-50'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-coral-500' : 'text-ocean-500'} />
                  {label}
                </Link>
              );
            })}

            <p className="px-5 pt-5 pb-1 text-[10px] font-medium text-ocean-700 uppercase tracking-wider">
              アカウント
            </p>
            {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                    active ? 'bg-coral-50 text-coral-600 font-medium' : 'text-ocean-900 hover:bg-ocean-50'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-coral-500' : 'text-ocean-500'} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* 下部CTA */}
          <div className="p-4 border-t border-ocean-100 space-y-2">
            <Link
              href="/dashboard/boats/new"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-coral-500 text-white font-medium text-sm hover:bg-coral-600"
            >
              <Plus size={16} /> 船を出品する
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-ocean-50 text-ocean-900 font-medium text-sm hover:bg-ocean-100"
            >
              <LogIn size={16} /> ログイン / 新規登録
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
