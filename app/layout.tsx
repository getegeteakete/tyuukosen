import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/marketplace/header';
import { Footer } from '@/components/marketplace/footer';
import { AiChatWidget } from '@/components/ai/ai-chat-widget';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';

export const metadata: Metadata = {
  title: {
    default: 'イイフネ🚢.com | 中古船売買AIサポートサイト',
    template: '%s | イイフネ🚢.com',
  },
  description:
    '中古船売買AIサポートサイト「イイフネ🚢.com」。プレジャーボート・漁船・ヨットの個人売買マーケット。AI登録支援、電子契約、ZOOM見学に対応。買い手登録は無料。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'イイフネ🚢.com',
    title: 'イイフネ🚢.com | 中古船売買AIサポートサイト',
    description: 'AIが出品も検索も契約も全部サポート。掲載料だけのシンプル料金で、いいフネとの出会いを。',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0E3A5C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Script
          src="https://widget.univapay.com/client/checkout.js"
          strategy="afterInteractive"
        />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <AiChatWidget />
        <MobileBottomNav />
      </body>
    </html>
  );
}
