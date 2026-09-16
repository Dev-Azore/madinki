import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GoogleAdSenseScript } from '@/components/ads/GoogleAdSenseScript';
import { DevCacheCleaner } from '@/components/layout/DevCacheCleaner';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TailorApp — Measurement Management',
  description: 'An installable web app for independent tailors to manage client measurements.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/icons/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TailorApp',
  },
};

export const viewport: Viewport = {
  themeColor: '#071A34',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-slate-950 antialiased">
        <DevCacheCleaner />
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
        <GoogleAdSenseScript />
        {children}
      </body>
    </html>
  );
}

