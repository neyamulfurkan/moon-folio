// src/components/layout/LayoutShell.tsx
'use client';

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PageTransition } from '@/components/layout/PageTransition';

type LayoutShellProps = {
  children: ReactNode;
};

const SESSION_KEY = 'spark-loading-done';

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const [loadingDone, setLoadingDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Skip loading on non-home pages immediately
      const isHomePage = window.location.pathname === '/';
      if (!isHomePage) return true;
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  const handleLoadingComplete = useCallback((): void => {
    setLoadingDone(true);
  }, []);

  return (
    <>
      {!loadingDone && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div
        style={{
          opacity: loadingDone ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
          pointerEvents: loadingDone ? 'auto' : 'none',
        }}
      >
        <Header />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CustomCursor />
      <ScrollProgress />
    </>
  );
};