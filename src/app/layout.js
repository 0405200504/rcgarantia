import './globals.css';
import SwRegister from '@/components/SwRegister';

export const metadata = {
  title: 'RC Garantia',
  description: 'Gestão de garantias para assistência técnica de celulares',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'RC Garantia' },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
