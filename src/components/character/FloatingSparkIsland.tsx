'use client';

import { useEffect, useRef, useState } from 'react';
import { SparkCharacter } from '@/components/character/SparkCharacter';



type Pos = {
  scale: number;
  rightPx: number;
  topPct: number;
  opacity: number;
};

// One target position per section
const SECTION_POSITIONS: Record<string, Pos> = {
  hero:       { scale: 1,    rightPx: -80, topPct: 50, opacity: 1    },
  about:      { scale: 0.32, rightPx: 12,  topPct: 85, opacity: 0.65 },
  skills:     { scale: 0.30, rightPx: 12,  topPct: 82, opacity: 0.62 },
  projects:   { scale: 0.28, rightPx: 12,  topPct: 85, opacity: 0.60 },
  experience: { scale: 0.26, rightPx: 12,  topPct: 88, opacity: 0.58 },
  contact:    { scale: 0.38, rightPx: -60, topPct: 72, opacity: 0.75 },
};

// SECTION_IDS removed — section detection handled inline in scroll handler

const MOBILE_POSITIONS: Record<string, Pos> = {
  hero:       { scale: 0.68, rightPx: -120, topPct: 48, opacity: 1.00 },
  about:      { scale: 0.28, rightPx: -8,  topPct: 88, opacity: 0.65 },
  skills:     { scale: 0.26, rightPx: -8,  topPct: 88, opacity: 0.62 },
  projects:   { scale: 0.24, rightPx: -8,  topPct: 88, opacity: 0.60 },
  experience: { scale: 0.22, rightPx: -8,  topPct: 88, opacity: 0.58 },
  contact:    { scale: 0.30, rightPx: 240, topPct: 68, opacity: 0.70 },
};

const FloatingSparkCore: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [pos, setPos] = useState<Pos>(SECTION_POSITIONS['hero']!);
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const currentSectionRef = useRef<string>('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    setIsAdmin(path.startsWith('/admin') || path.startsWith('/projects/'));

    const handleOverlayOpen = (): void => setOverlayOpen(true);
    const handleOverlayClose = (): void => setOverlayOpen(false);
    window.addEventListener('spark:overlay:open', handleOverlayOpen);
    window.addEventListener('spark:overlay:close', handleOverlayClose);
    return () => {
      window.removeEventListener('spark:overlay:open', handleOverlayOpen);
      window.removeEventListener('spark:overlay:close', handleOverlayClose);
    };
  }, []);

  useEffect(() => {
    const sectionOrder = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'] as const;
    let rafPending = false;

    const onScroll = (): void => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Update scroll progress
        const newProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(Math.min(1, Math.max(0, newProgress)));

        // Update section position
        const index = Math.round(scrollTop / window.innerHeight);
        const clampedIndex = Math.max(0, Math.min(index, sectionOrder.length - 1));
        const id = sectionOrder[clampedIndex];
        if (id && currentSectionRef.current !== id) {
          currentSectionRef.current = id;
          setCurrentSection(id);
          const target = SECTION_POSITIONS[id];
          if (target) setPos(target);
        }

        rafPending = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const activePos = isMobile
    ? (MOBILE_POSITIONS[currentSection] ?? MOBILE_POSITIONS['hero']!)
    : pos;

  if (isAdmin || overlayOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: `${activePos.rightPx}px`,
        top: `${activePos.topPct}%`,
        transform: `translateY(-50%) scale(${activePos.scale})`,
        transformOrigin: 'right center',
        opacity: activePos.opacity,
        zIndex: 50,
        pointerEvents: 'none',
        width: '480px',
        transition: 'right 0.4s cubic-bezier(0.25,0.46,0.45,0.94), top 0.4s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease',
      }}
      aria-hidden="true"
    >
      <SparkCharacter size="hero" showChat={false} scrollProgress={scrollProgress} />
    </div>
  );
};

export const FloatingSparkIsland = FloatingSparkCore;
export const FloatingSparkPortal = FloatingSparkCore;