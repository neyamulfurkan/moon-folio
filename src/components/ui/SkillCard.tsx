'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Skill } from '@/types/index';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type SkillCardProps = {
  skill: Skill;
  index: number;
  isActive: boolean;
  stackPosition: 0 | 1 | 2 | 3;
};

const STACK_TRANSFORMS: Record<
  0 | 1 | 2 | 3,
  { x: number; rotate: number; scale: number }
> = {
  0: { x: 0, rotate: 0, scale: 1 },
  1: { x: 40, rotate: 3, scale: 0.96 },
  2: { x: 70, rotate: 5, scale: 0.92 },
  3: { x: 100, rotate: 7, scale: 0.88 },
};

type LedState = 'unlit' | 'lighting' | 'lit';

const WebPattern: React.FC = () => (
  <defs>
    <pattern
      id="pattern-web"
      x="0"
      y="0"
      width="40"
      height="40"
      patternUnits="userSpaceOnUse"
    >
      <text
        x="2"
        y="14"
        fontFamily="monospace"
        fontSize="11"
        fill="currentColor"
      >
        {'{'}
      </text>
      <text
        x="20"
        y="14"
        fontFamily="monospace"
        fontSize="11"
        fill="currentColor"
      >
        {'}'}
      </text>
      <text
        x="4"
        y="32"
        fontFamily="monospace"
        fontSize="10"
        fill="currentColor"
      >
        {'<>'}
      </text>
    </pattern>
  </defs>
);

const HardwarePattern: React.FC = () => (
  <defs>
    <pattern
      id="pattern-hardware"
      x="0"
      y="0"
      width="32"
      height="32"
      patternUnits="userSpaceOnUse"
    >
      {/* PCB trace L-shape top-left */}
      <path
        d="M4,4 L4,14 L14,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* PCB trace L-shape bottom-right */}
      <path
        d="M18,18 L28,18 L28,28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Pad circles */}
      <circle cx="4" cy="4" r="2" fill="currentColor" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
      <circle cx="28" cy="28" r="2" fill="currentColor" />
    </pattern>
  </defs>
);

const ToolsPattern: React.FC = () => (
  <defs>
    <pattern
      id="pattern-tools"
      x="0"
      y="0"
      width="48"
      height="24"
      patternUnits="userSpaceOnUse"
    >
      <text
        x="2"
        y="16"
        fontFamily="monospace"
        fontSize="12"
        fill="currentColor"
      >
        $
      </text>
      <text
        x="14"
        y="16"
        fontFamily="monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.5"
      >
        _
      </text>
    </pattern>
  </defs>
);

const LearningPattern: React.FC = () => (
  <defs>
    <pattern
      id="pattern-learning"
      x="0"
      y="0"
      width="20"
      height="20"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </pattern>
  </defs>
);

const CATEGORY_PATTERNS: Record<
  string,
  { Component: React.FC; patternId: string }
> = {
  web: { Component: WebPattern, patternId: 'pattern-web' },
  hardware: { Component: HardwarePattern, patternId: 'pattern-hardware' },
  tools: { Component: ToolsPattern, patternId: 'pattern-tools' },
  learning: { Component: LearningPattern, patternId: 'pattern-learning' },
};

const MAX_VISIBLE_SKILLS = 8;

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isActive,
  stackPosition,
}) => {
  const isReduced = useReducedMotion();
  const wasActive = useRef(false);
  const [ledStates, setLedStates] = useState<LedState[]>(() =>
    Array.from({ length: 5 }, (_, i) =>
      i < skill.proficiency ? 'lit' : 'unlit'
    )
  );
  const ledTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const skillsContainerRef = useRef<HTMLDivElement>(null);

  const patternInfo =
    CATEGORY_PATTERNS[skill.category] ?? CATEGORY_PATTERNS['web'];
  const PatternComponent = patternInfo?.Component ?? WebPattern;
  const patternId = patternInfo?.patternId ?? 'pattern-web';

  const transform = STACK_TRANSFORMS[stackPosition];

  // LED sequential lighting on activate
  useEffect(() => {
    if (isActive && !wasActive.current) {
      wasActive.current = true;

      if (isReduced) {
        setLedStates(
          Array.from({ length: 5 }, (_, i) =>
            i < skill.proficiency ? 'lit' : 'unlit'
          )
        );
        return;
      }

      // Reset all lit LEDs to off first
      setLedStates(
        Array.from({ length: 5 }, (_, i) =>
          i < skill.proficiency ? 'unlit' : 'unlit'
        )
      );

      ledTimers.current.forEach(clearTimeout);
      ledTimers.current = [];

      for (let i = 0; i < skill.proficiency; i++) {
        const timer = setTimeout(
          () => {
            setLedStates((prev) => {
              const next = [...prev] as LedState[];
              next[i] = 'lighting';
              return next;
            });

            const settleTimer = setTimeout(() => {
              setLedStates((prev) => {
                const next = [...prev] as LedState[];
                next[i] = 'lit';
                return next;
              });
            }, 80);

            ledTimers.current.push(settleTimer);
          },
          i * 150
        );

        ledTimers.current.push(timer);
      }
    } else if (!isActive) {
      wasActive.current = false;
    }

    return () => {
      ledTimers.current.forEach(clearTimeout);
    };
  }, [isActive, isReduced, skill.proficiency]);

  const displayedSkills = [skill].slice(0, MAX_VISIBLE_SKILLS);
  const hasMoreSkills = false; // single skill per card; overflow handled at section level

  return (
    <motion.div
      animate={{
        x: transform.x,
        rotate: transform.rotate,
        scale: transform.scale,
      }}
      transition={
        isReduced
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }
      }
      style={{
        pointerEvents: stackPosition === 3 ? 'none' : 'auto',
        position: 'absolute',
        top: 0,
        left: 0,
        transformOrigin: 'bottom center',
      }}
      className={cn(
        'w-[480px] h-[320px] rounded-xl overflow-hidden',
        'border border-[var(--color-border-default)]',
        'bg-[var(--color-bg-secondary)]',
        'flex flex-col',
        'select-none'
      )}
    >
      {/* SVG background pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        style={{ opacity: 0.03, color: 'var(--color-text-primary)' }}
      >
        <PatternComponent />
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Card content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header row: category + LEDs */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] uppercase tracking-[0.15em] font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {skill.category}
          </span>

          {/* LED row */}
          <div className="flex items-center gap-[6px]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => {
              const isLit = i < skill.proficiency;
              const state = ledStates[i] ?? 'unlit';
              const isLighting = state === 'lighting';

              return (
                <motion.span
                  key={i}
                  animate={
                    isReduced
                      ? {}
                      : isLighting
                        ? { scale: [1, 1.3, 1], opacity: [0.08, 1, 1] }
                        : {}
                  }
                  transition={{ duration: 0.08, ease: 'easeOut' }}
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isLit
                      ? 'var(--color-accent)'
                      : 'var(--color-border-default)',
                    opacity: state === 'unlit' && isLit ? 0.08 : isLit ? 1 : 0.15,
                    boxShadow:
                      state === 'lit' && isLit
                        ? '0 0 8px var(--color-accent)'
                        : 'none',
                    transition: isReduced ? 'none' : 'box-shadow 0.08s ease',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Skill name */}
        <div className="mb-2">
          <h3
            className="text-xl font-semibold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {skill.name}
          </h3>
        </div>

        {/* Proficiency label */}
        <div className="mb-auto">
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            proficiency:{' '}
            <span style={{ color: 'var(--color-accent)' }}>
              {skill.proficiency}/5
            </span>
          </span>
        </div>

        {/* Skill list area (for section-level skill arrays — placeholder for multi-skill cards) */}
        {displayedSkills.length > 0 && (
          <div
            ref={skillsContainerRef}
            className="mt-4 overflow-hidden"
            style={{ maxHeight: 120 }}
          >
            {hasMoreSkills && (
              <div
                className="absolute bottom-0 left-0 right-0 flex justify-center pb-1"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, var(--color-bg-secondary))',
                  height: 32,
                }}
              >
                <span
                  className="text-[10px] font-mono self-end"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  scroll ↓
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sort order indicator (decorative) */}
        <div
          className="flex items-center gap-2 mt-4 pt-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <span
            className="text-[10px] font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {String(skill.sortOrder).padStart(3, '0')}
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: 'var(--color-border-default)' }}
          >
            ──
          </span>
          <span
            className="text-[10px] font-mono truncate"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {skill.category}.{skill.name.toLowerCase().replace(/\s+/g, '_')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};