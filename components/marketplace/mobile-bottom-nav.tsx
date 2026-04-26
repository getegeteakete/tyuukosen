'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';

const TABS = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/boats', label: '探す', icon: Search },
  { href: '/dashboard/boats/new', label: '出品', icon: Plus, accent: true },
  { href: '/wanted', label: '探求', icon: MessageCircle },
  { href: '/dashboard', label: 'マイ', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // チャット・署名ページでは非表示（コンテンツ専念）
  if (pathname?.startsWith('/chat/') || pathname?.startsWith('/sign/') || pathname?.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ocean-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {TABS.map(({ href, label, icon: Icon, accent }) => {
          const isActive =
            href === '/' ? pathname === '/' :
            href === '/dashboard' ? pathname?.startsWith('/dashboard') && !pathname.startsWith('/dashboard/boats/new') :
            pathname?.startsWith(href);

          if (accent) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center"
              >
                <span className="w-10 h-10 -mt-3 rounded-full bg-coral-500 text-white shadow-lg flex items-center justify-center">
                  <Icon size={20} />
                </span>
                <span className="text-[10px] font-medium text-coral-500 mt-0.5">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                isActive ? 'text-coral-500' : 'text-ocean-700'
              }`}
            >
              <Icon size={20} />
              <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
