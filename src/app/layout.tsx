import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'WarehouseHub — Premium Storage & Organisation',
    template: '%s | WarehouseHub',
  },
  description:
    'Thoughtfully designed storage and organisation solutions for considered living. Crafted to last, built to inspire.',
  keywords: ['storage', 'organisation', 'shelving', 'warehouse', 'home storage', 'premium storage'],
  authors: [{ name: 'WarehouseHub' }],
  creator: 'WarehouseHub',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'WarehouseHub',
    title: 'WarehouseHub — Premium Storage & Organisation',
    description:
      'Thoughtfully designed storage and organisation solutions for considered living.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WarehouseHub — Premium Storage & Organisation',
    description:
      'Thoughtfully designed storage and organisation solutions for considered living.',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        {/* Google Fonts preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fwarehouseh2608back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.3" /></head>
      <body className="bg-chalk text-ink font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
