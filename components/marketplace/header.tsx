import Link from 'next/link';
import { Search, User, Plus } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-ocean-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M4 22h24l-3 5H7l-3-5z" fill="#0E3A5C" />
            <path d="M16 4l8 14H8L16 4z" fill="#F25C54" />
          </svg>
          <span className="font-display font-bold text-lg text-ocean-900">
            中古船マーケット
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-ocean-800">
          <Link href="/boats" className="hover:text-coral-500">中古船を探す</Link>
          <Link href="/parts" className="hover:text-coral-500">パーツ</Link>
          <Link href="/wanted" className="hover:text-coral-500">探しています</Link>
          <Link href="/pricing" className="hover:text-coral-500">出品プラン</Link>
        </nav>

        <div className="flex-1" />

        <Link
          href="/boats"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ocean-50 text-ocean-800 hover:bg-ocean-100 text-sm"
        >
          <Search size={16} /> 検索
        </Link>
        <Link
          href="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-ocean-50 text-sm text-ocean-800"
        >
          <User size={16} /> マイページ
        </Link>
        <Link
          href="/dashboard/boats/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-coral-500 text-white hover:bg-coral-600 text-sm font-medium"
        >
          <Plus size={16} /> 出品する
        </Link>
      </div>
    </header>
  );
}
