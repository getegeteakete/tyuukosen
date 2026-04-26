import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/marketplace/header';
import { Footer } from '@/components/marketplace/footer';
import { AiChatWidget } from '@/components/ai/ai-chat-widget';
import { MobileBottomNav } from '@/components/marketplace/mobile-bottom-nav';

export const metadata: Metadata = {
  title: {
    default: '中古船マーケット | AIで簡単・安心の中古船売買',
    template: '%s | 中古船マーケット',
  },
  description:
    'プレジャーボート、漁船、ヨットの中古船売買マーケットプレイス。AI登録支援、電子契約、ZOOM見学に対応。掲載は無料、買い手登録も無料。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '中古船マーケット',
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
