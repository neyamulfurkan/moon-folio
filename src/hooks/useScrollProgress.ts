'use client';

import { useState, useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

type ScrollDirection = 'up' | 'down';

type UseScrollProgressReturn = {
  progress: ReturnType<typeof useMotionValue<number>>;
  direction: ScrollDirection;
  isScrolled: boolean;
};

export const useScrollProgress = (): UseScrollProgressReturn => {
  const progress = useMotionValue(0);
  const directionRef = useRef<ScrollDirection>('down');
  const [direction, setDirection] = useState<ScrollDirection>('down');
  const isScrolledRef = useRef(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const previousScrollY = useRef(0);
  const rafPending = useRef(false);

  useEffect(() => {
    const handleScroll = (): void => {
      if (rafPending.current) return;
      rafPending.current = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const rawProgress = scrollHeight > 0 ? currentScrollY / scrollHeight : 0;
        const clampedProgress = Math.min(1, Math.max(0, rawProgress));
        progress.set(clampedProgress);

        const newDirection: ScrollDirection = currentScrollY > previousScrollY.current ? 'down' : 'up';
        if (newDirection !== directionRef.current) {
          directionRef.current = newDirection;
          setDirection(newDirection);
        }

        const newIsScrolled = currentScrollY > 50;
        if (newIsScrolled !== isScrolledRef.current) {
          isScrolledRef.current = newIsScrolled;
          setIsScrolled(newIsScrolled);
        }

        previousScrollY.current = currentScrollY;
        rafPending.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const initialScrollY = window.scrollY;
    const initialScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const initialProgress = initialScrollHeight > 0 ? initialScrollY / initialScrollHeight : 0;
    progress.set(Math.min(1, Math.max(0, initialProgress)));
    isScrolledRef.current = initialScrollY > 50;
    setIsScrolled(initialScrollY > 50);
    previousScrollY.current = initialScrollY;

    return () => {
      window.removeEventListener('scroll', handleScroll);
      rafPending.current = false;
    };
  }, [progress]);

  return { progress, direction, isScrolled };
};