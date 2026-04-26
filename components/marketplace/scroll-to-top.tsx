'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // チャット・署名ページでは非表示
  if (pathname?.startsWith('/chat/') || pathname?.startsWith('/sign/')) {
    return null;
  }

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="ページ上部に戻る"
      className={`fixed z-30 right-4 md:right-5
                  bottom-[180px] md:bottom-[110px]
                  w-11 h-11 rounded-full bg-white border border-ocean-200 text-ocean-900 shadow-lg
                  flex items-center justify-center
                  transition-all duration-300
                  hover:bg-ocean-50 hover:border-coral-300 hover:text-coral-500 hover:scale-110
                  ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
    >
      <ChevronUp size={20} />
    </button>
  );
}
