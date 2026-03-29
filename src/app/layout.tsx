// src/app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { FloatingSparkPortal } from '@/components/character/FloatingSparkIsland';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: {
    default: 'Moon — EEE Student & Developer',
    template: '%s | Moon',
  },
  description:
    'Electrical and Electronics Engineering student and full-stack web developer. Building production web apps and hardware projects.',
  keywords: [
    'next.js',
    'typescript',
    'full-stack',
    'EEE',
    'electrical engineering',
    'web developer',
    'portfolio',
  ],
  authors: [{ name: 'Moon' }],
  creator: 'Moon',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Moon — Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moondev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#07090f',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = async ({ children }) => {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdminRoute = pathname.startsWith('/admin');
  return (
    <html lang="en">
      <head>
        {/* ── Blocking background — must fire before any stylesheet ── */}
        <style
          dangerouslySetInnerHTML={{
            __html: 'body{background-color:#07090f;}',
          }}
        />

        {/* ── Syne (display) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preload weight-600 subset first — used in hero headline (critical path) */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600&subset=latin&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap"
        />

        {/* ── JetBrains Mono (mono) ── */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />

        {/* ── Favicons ── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {!isAdminRoute && <AmbientBackground />}
        <LayoutShell>{children}</LayoutShell>
        {!isAdminRoute && <FloatingSparkPortal />}
      </body>
    </html>
  );
};

export default RootLayout;