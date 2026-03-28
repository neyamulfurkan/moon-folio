'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

type SectionTransitionProps = {
  children: React.ReactNode;
  id: string;
  label: string;
  zIndex: number;
  bgColor?: 'primary' | 'secondary';
  className?: string;
};

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  id,
  label,
  zIndex,
  bgColor = 'primary',
  className,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const previousSibling = section.previousElementSibling as HTMLElement | null;
          if (!previousSibling) return;

          if (entry.isIntersecting) {
            previousSibling.setAttribute('data-scaled', 'true');
          } else if (entry.boundingClientRect.top > 0) {
            previousSibling.removeAttribute('data-scaled');
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '-1px 0px 0px 0px',
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [isReduced]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        [data-scaled='true'] {
          transform: scale(0.97);
          transition: transform 0.3s ease;
        }
        [data-scaled='true']::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(7, 9, 15, 0.3);
          pointer-events: none;
          z-index: 1;
        }
        [data-section-id] {
          position: relative;
          transition: transform 0.3s ease;
        }
      ` }} />
      <section
        ref={sectionRef}
        id={id}
        data-section-id={id}
        style={{
          position: 'sticky',
          top: 0,
          zIndex,
          overflow: 'clip',
          height: '100vh',
          scrollSnapAlign: 'start',
          backgroundColor:
            bgColor === 'secondary'
              ? 'var(--color-bg-secondary)'
              : 'var(--color-bg-primary)',
        }}
        className={cn('w-full', className)}
      >
        {/* Tab strip */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '24px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              transform: 'rotate(-1deg)',
              display: 'inline-block',
              letterSpacing: '0.05em',
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </div>

        {/* Ambient weather background */}
        <AmbientBackground />

        {/* Section content */}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </section>
    </>
  );
};