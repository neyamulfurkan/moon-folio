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
  hero:       { scale: 1,    rightPx: 24,  topPct: 50, opacity: 1    },
  about:      { scale: 0.50, rightPx: 6,   topPct: 75, opacity: 0.75 },
  skills:     { scale: 0.48, rightPx: 6,   topPct: 60, opacity: 0.72 },
  projects:   { scale: 0.44, rightPx: 6,   topPct: 62, opacity: 0.68 },
  experience: { scale: 0.40, rightPx: 6,   topPct: 78, opacity: 0.62 },
  contact:    { scale: 0.36, rightPx: 8,   topPct: 65, opacity: 0.58 },
};

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'] as const;

const FloatingSparkCore: React.FC = () => {
  const [pos, setPos] = useState<Pos>(SECTION_POSITIONS['hero']!);
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const currentSectionRef = useRef<string>('hero');

  const lastScrollTop = useRef(0);
  const scrollingDown = useRef(true);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const main = document.getElementById('main');

    // Track scroll direction
    const onScroll = () => {
      const st = main ? main.scrollTop : window.scrollY;
      scrollingDown.current = st > lastScrollTop.current;
      lastScrollTop.current = st;
    };
    main?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hero: fires on ANY visibility — immediately restores full size
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only restore hero if scrolling UP or at very top
            if (entry.isIntersecting && !scrollingDown.current) {
              currentSectionRef.current = 'hero';
              setCurrentSection('hero');
              setPos(SECTION_POSITIONS['hero']!);
            }
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              currentSectionRef.current = 'hero';
              setCurrentSection('hero');
              setPos(SECTION_POSITIONS['hero']!);
            }
          });
        },
        {
          threshold: [0.01, 0.1, 0.3, 0.5, 0.8, 1.0],
          root: main,
        }
      );
      heroObserver.observe(heroEl);
      observers.push(heroObserver);
    }

    // Non-hero: only activate when scrolling DOWN and well into view
    SECTION_IDS.filter((id) => id !== 'hero').forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio >= 0.4 &&
              scrollingDown.current
            ) {
              if (currentSectionRef.current !== id) {
                currentSectionRef.current = id;
                setCurrentSection(id);
                const target = SECTION_POSITIONS[id];
                if (target) setPos(target);
              }
            }
          });
        },
        {
          threshold: [0.4, 0.6],
          root: main,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      main?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const main = document.getElementById('main');
    const onScroll = () => {
      const el = main ?? document.documentElement;
      const scrollTop = main ? main.scrollTop : window.scrollY;
      const scrollHeight = main ? main.scrollHeight - main.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };
    main?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main?.removeEventListener('scroll', onScroll);
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
    hero:       { scale: 0.42, rightPx: -28, topPct: 15, opacity: 0.80 },
    about:      { scale: 0.30, rightPx: -32, topPct: 78, opacity: 0.65 },
    skills:     { scale: 0.28, rightPx: -34, topPct: 18, opacity: 0.60 },
    projects:   { scale: 0.26, rightPx: -34, topPct: 18, opacity: 0.58 },
    experience: { scale: 0.24, rightPx: -34, topPct: 80, opacity: 0.55 },
    contact:    { scale: 0.34, rightPx: 360, topPct: 65, opacity: 0.80 },
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