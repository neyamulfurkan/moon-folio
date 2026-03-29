'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import type { Experience } from '@/types/index';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SectionTransition } from '@/components/ui/SectionTransition';

type ExperienceSectionProps = {
  experience: Experience[];
};

// ── inline ExperienceNode (no external import needed) ──────────────────────

const getYear = (date: Date | string): string =>
  new Date(date).getFullYear().toString();

type InlineNodeProps = {
  experience: Experience;
  index: number;
  isActive: boolean;
  isReduced: boolean;
};

const InlineExperienceNode: React.FC<InlineNodeProps> = ({
  experience,
  index,
  isActive,
  isReduced,
}) => {
  const dateRange = experience.isPresent
    ? `${getYear(experience.startDate)}–Present`
    : `${getYear(experience.startDate)}–${
        experience.endDate ? getYear(experience.endDate) : ''
      }`;

  const typeColor =
    experience.type === 'work'
      ? 'var(--color-accent)'
      : 'var(--color-amber, #e8880a)';

  return (
    <motion.article
      initial={{ opacity: 0, y: isReduced ? 0 : 16 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: isReduced ? 0 : 16 }}
      transition={isReduced ? { duration: 0.15 } : { duration: 0.35, ease: 'easeOut' }}
      role="group"
      aria-label={`${experience.role} at ${experience.organization}`}
      style={{
        position: 'relative',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: '6px',
        padding: '28px 28px 24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* top accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: typeColor,
          opacity: 0.7,
        }}
      />

      {/* IC label + type badge row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.08em',
            userSelect: 'none',
          }}
        >
          IC-{index.toString().padStart(2, '0')}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: typeColor,
            background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${typeColor} 30%, transparent)`,
            borderRadius: '3px',
            padding: '2px 6px',
          }}
        >
          {experience.type}
        </span>
      </div>

      {/* Date */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          marginBottom: '8px',
          letterSpacing: '0.04em',
        }}
      >
        {dateRange}
      </div>

      {/* Role */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1.25,
          marginBottom: '4px',
          fontFamily: 'var(--font-display)',
        }}
      >
        {experience.role}
      </h3>

      {/* Organization */}
      <p
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '14px',
          fontFamily: 'var(--font-display)',
        }}
      >
        {experience.organization}
      </p>

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          background: 'var(--color-border-subtle)',
          marginBottom: '14px',
        }}
      />

      {/* Bullets */}
      {experience.description.length > 0 && (
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            flex: 1,
          }}
        >
          {experience.description.map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  color: typeColor,
                  fontSize: '11px',
                  lineHeight: '1.8',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                ›
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
};

// ── mini-map bar ────────────────────────────────────────────────────────────

type MiniMapProps = {
  items: Experience[];
  activeIndex: number;
  onSelect: (i: number) => void;
  isReduced: boolean;
};

const ExperienceMiniMap: React.FC<MiniMapProps> = ({
  items,
  activeIndex,
  onSelect,
  isReduced,
}) => (
  <div
    role="tablist"
    aria-label="Experience navigation"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: '8px',
      padding: '6px 8px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    {items.map((exp, i) => {
      const isActive = i === activeIndex;
      const typeColor =
        exp.type === 'work'
          ? 'var(--color-accent)'
          : 'var(--color-amber, #e8880a)';
      return (
        <button
          key={exp.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-label={`${exp.role} at ${exp.organization}`}
          onClick={() => onSelect(i)}
          data-cursor="pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            background: isActive
              ? `color-mix(in srgb, ${typeColor} 14%, transparent)`
              : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: isReduced ? 'none' : 'background 180ms, color 180ms',
            flexShrink: 0,
          }}
        >
          {/* dot */}
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              width: isActive ? 7 : 5,
              height: isActive ? 7 : 5,
              borderRadius: '50%',
              background: isActive ? typeColor : 'var(--color-border-strong)',
              boxShadow: isActive ? `0 0 6px ${typeColor}` : 'none',
              flexShrink: 0,
              transition: isReduced ? 'none' : 'all 200ms',
            }}
          />
          {/* label */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.04em',
              color: isActive ? typeColor : 'var(--color-text-tertiary)',
              fontWeight: isActive ? 500 : 400,
              transition: isReduced ? 'none' : 'color 180ms',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {exp.organization}
          </span>
        </button>
      );
    })}

    {/* total count badge */}
    <div
      aria-hidden="true"
      style={{
        marginLeft: '8px',
        paddingLeft: '8px',
        borderLeft: '1px solid var(--color-border-subtle)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--color-text-tertiary)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {activeIndex + 1}/{items.length}
    </div>
  </div>
);

// ── nav arrow ───────────────────────────────────────────────────────────────

type ExpNavArrowProps = {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
};

const ExpNavArrow: React.FC<ExpNavArrowProps> = ({ direction, onClick, disabled }) => (
  <button
    type="button"
    aria-label={direction === 'prev' ? 'Previous experience' : 'Next experience'}
    onClick={onClick}
    disabled={disabled}
    data-cursor="pointer"
    style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.25 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 200ms, background 200ms',
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      if (!disabled)
        (e.currentTarget as HTMLButtonElement).style.background =
          'rgba(0,212,255,0.12)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        'var(--color-bg-secondary)';
    }}
  >
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--color-text-primary)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'prev' ? (
        <polyline points="10,3 5,8 10,13" />
      ) : (
        <polyline points="6,3 11,8 6,13" />
      )}
    </svg>
  </button>
);

// ── horizontal PCB wire SVG ─────────────────────────────────────────────────

type HorizWireProps = {
  count: number;
  activeIndex: number;
  isReduced: boolean;
};

const HorizontalPCBWire: React.FC<HorizWireProps> = ({
  count,
  activeIndex,
  isReduced,
}) => {
  if (count === 0) return null;
  const W = 600;
  const H = 32;
  const nodeSpacing = count > 1 ? W / (count - 1) : 0;
  const cx = (i: number): number => (count === 1 ? W / 2 : i * nodeSpacing);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ width: '100%', height: 32, overflow: 'visible', display: 'block' }}
    >
      {/* main horizontal trace */}
      <line
        x1={0}
        y1={H / 2}
        x2={W}
        y2={H / 2}
        stroke="var(--color-accent)"
        strokeOpacity={0.2}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* active segment highlight */}
      {count > 1 && (
        <motion.line
          x1={0}
          y1={H / 2}
          x2={cx(activeIndex)}
          y2={H / 2}
          stroke="var(--color-accent)"
          strokeOpacity={0.7}
          strokeWidth={1.5}
          animate={{ x2: cx(activeIndex) }}
          transition={isReduced ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
        />
      )}
      {/* node dots */}
      {Array.from({ length: count }).map((_, i) => (
        <motion.circle
          key={i}
          cx={cx(i)}
          cy={H / 2}
          r={i === activeIndex ? 5 : 3}
          fill={i === activeIndex ? 'var(--color-accent)' : 'var(--color-border-strong)'}
          animate={{
            r: i === activeIndex ? 5 : 3,
            fill:
              i === activeIndex
                ? 'var(--color-accent)'
                : 'var(--color-border-strong)',
          }}
          transition={isReduced ? { duration: 0 } : { duration: 0.25 }}
        />
      ))}
    </svg>
  );
};

// ── main component ──────────────────────────────────────────────────────────

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const isReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingParenControls = useAnimationControls();
  const [headingGlowed, setHeadingGlowed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // heading glow on enter
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !headingGlowed) {
            setHeadingGlowed(true);
            void headingParenControls.start({
              textShadow: [
                '0 0 0px var(--color-accent)',
                '0 0 14px var(--color-accent)',
                '0 0 0px var(--color-accent)',
              ],
              transition: { duration: 0.7, times: [0, 0.4, 1] },
            });
          }
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [headingGlowed, headingParenControls]);

  // keyboard navigation scoped to section visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isVisibleRef.current) return;
      if (e.key === 'ArrowLeft')
        setActiveIndex((p) => Math.max(0, p - 1));
      else if (e.key === 'ArrowRight')
        setActiveIndex((p) => Math.min(experience.length - 1, p + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [experience.length]);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < experience.length - 1;

  return (
    <SectionTransition id="experience" label="experience.exec()" zIndex={50}>
      <div
        ref={sectionRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '60px 16px 48px' : '72px 48px 64px',
          overflow: 'hidden',
        }}
      >
        {/* ── heading ── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              display: 'inline-flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>timeline</span>
            <motion.span
              animate={headingParenControls}
              style={{
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                display: 'inline-block',
              }}
            >
              .exec()
            </motion.span>
          </h2>
          <p
            style={{
              marginTop: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
            }}
          >
            // {experience.length} entr{experience.length === 1 ? 'y' : 'ies'} — use ← → to navigate
          </p>
        </div>

        {experience.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            // no experience entries yet
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '900px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {/* ── mini-map bar ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ExperienceMiniMap
                items={experience}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                isReduced={isReduced}
              />
            </div>

            {/* ── PCB horizontal wire ── */}
            <div style={{ padding: '0 4px' }}>
              <HorizontalPCBWire
                count={experience.length}
                activeIndex={activeIndex}
                isReduced={isReduced}
              />
            </div>

            {/* ── card + nav row ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '12px',
                flex: 1,
                minHeight: isMobile ? '360px' : '320px',
              }}
            >
              <ExpNavArrow
                direction="prev"
                onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
                disabled={!hasPrev}
              />

              {/* card area */}
              <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                <AnimatePresence mode="wait">
                  {experience[activeIndex] && (
                    <motion.div
                      key={experience[activeIndex]!.id}
                      initial={{ opacity: 0, x: isReduced ? 0 : 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isReduced ? 0 : -24 }}
                      transition={
                        isReduced
                          ? { duration: 0.12 }
                          : { duration: 0.28, ease: 'easeInOut' }
                      }
                      style={{ height: '100%' }}
                    >
                      <InlineExperienceNode
                        experience={experience[activeIndex]!}
                        index={activeIndex + 1}
                        isActive
                        isReduced={isReduced}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ExpNavArrow
                direction="next"
                onClick={() =>
                  setActiveIndex((p) => Math.min(experience.length - 1, p + 1))
                }
                disabled={!hasNext}
              />
            </div>

            {/* ── keyboard hint ── */}
            <div
              aria-hidden="true"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <span>← →</span>
              <span>navigate</span>
            </div>
          </div>
        )}
      </div>
    </SectionTransition>
  );
};