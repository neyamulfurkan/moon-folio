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

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'] as const;

const FloatingSparkCore: React.FC = () => {
  const [pos, setPos] = useState<Pos>(SECTION_POSITIONS['hero']!);
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const currentSectionRef = useRef<string>('hero');

  const lastScrollTop = useRef(0);
  const scrollingDown = useRef(true);

  useEffect(() => {
    const sectionOrder = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'] as const;

    const onScroll = () => {
      const index = Math.round(window.scrollY / window.innerHeight);
      const clampedIndex = Math.max(0, Math.min(index, sectionOrder.length - 1));
      const id = sectionOrder[clampedIndex];
      if (!id) return;
      if (currentSectionRef.current !== id) {
        currentSectionRef.current = id;
        setCurrentSection(id);
        const target = SECTION_POSITIONS[id];
        if (target) setPos(target);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile positions — smaller, top-right corner, out of content way
  const MOBILE_POSITIONS: Record<string, Pos> = {
    hero:       { scale: 0.68, rightPx: -120, topPct: 48, opacity: 1.00 },
    about:      { scale: 0.28, rightPx: -8,  topPct: 88, opacity: 0.65 },
    skills:     { scale: 0.26, rightPx: -8,  topPct: 88, opacity: 0.62 },
    projects:   { scale: 0.24, rightPx: -8,  topPct: 88, opacity: 0.60 },
    experience: { scale: 0.22, rightPx: -8,  topPct: 88, opacity: 0.58 },
    contact:    { scale: 0.30, rightPx: 170, topPct: 80, opacity: 0.70 },
  };

  const activePos = isMobile
    ? (MOBILE_POSITIONS[currentSection] ?? MOBILE_POSITIONS['hero']!)
    : pos;

  return (
    <div
      style={{
        position: 'fixed',
        right: `${activePos.rightPx}px`,
        top: `${activePos.topPct}%`,
        transform: `translateY(-50%) scale(${activePos.scale})`,
        transformOrigin: 'right center',
        opacity: activePos.opacity,
        zIndex: 200,
        pointerEvents: 'none',
        width: '480px',
        transition: 'right 0.6s cubic-bezier(0.25,0.46,0.45,0.94), top 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s ease',
      }}
      aria-hidden="true"
    >
      <SparkCharacter size="hero" showChat={false} scrollProgress={scrollProgress} />
    </div>
  );
};

export const FloatingSparkIsland = FloatingSparkCore;
export const FloatingSparkPortal = FloatingSparkCore;