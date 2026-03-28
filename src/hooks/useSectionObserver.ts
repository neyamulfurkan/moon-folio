'use client';

import { useState, useEffect, useRef } from 'react';

export const useSectionObserver = (
  sectionIds: string[]
): { activeSection: string | null } => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.intersectionRatio);
        }

        let maxRatio = 0;
        let maxId: string | null = null;
        let maxBottom = -Infinity;

        for (const id of sectionIds) {
          const ratio = ratiosRef.current.get(id) ?? 0;
          const el = document.getElementById(id);
          const bottom = el?.getBoundingClientRect().bottom ?? -Infinity;

          if (
            ratio > maxRatio ||
            (ratio === maxRatio && ratio > 0 && bottom > maxBottom)
          ) {
            maxRatio = ratio;
            maxId = id;
            maxBottom = bottom;
          }
        }

        if (maxRatio > 0) {
          setActiveSection(maxId);
        }
      },
      { threshold: [0.2, 0.5, 0.8] }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return { activeSection };
};