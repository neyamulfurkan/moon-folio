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

const MobileExperienceView: React.FC<{
  experience: Experience[];
  isReduced: boolean;
}> = ({ experience, isReduced }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = Array.from(container.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = cards.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [experience]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 12px', flexShrink: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>timeline</span>
          <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>.exec()</span>
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 6, letterSpacing: '0.06em' }}>
          swipe to explore {experience.length} entr{experience.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: isReduced ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          alignItems: 'center',
        }}
      >
        {experience.map((exp, i) => {
          const isActive = i === activeIndex;
          const typeColor = exp.type === 'work' ? 'var(--color-accent)' : 'var(--color-amber, #e8880a)';
          const dateRange = exp.isPresent
            ? `${getYear(exp.startDate)}–Present`
            : `${getYear(exp.startDate)}–${exp.endDate ? getYear(exp.endDate) : ''}`;
          return (
            <div
              key={exp.id}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                width: 'calc(100vw - 48px)',
                marginLeft: i === 0 ? '24px' : '12px',
                marginRight: i === experience.length - 1 ? '24px' : '12px',
                height: 'calc(100% - 16px)',
                maxHeight: 520,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-secondary)',
                border: isActive ? `1px solid color-mix(in srgb, ${typeColor} 35%, transparent)` : '1px solid var(--color-border-default)',
                boxShadow: isActive ? `0 0 0 1px color-mix(in srgb, ${typeColor} 10%, transparent), 0 24px 64px rgba(0,0,0,0.7)` : '0 8px 32px rgba(0,0,0,0.4)',
                transform: isActive ? 'scale(1)' : 'scale(0.94)',
                transition: isReduced ? 'none' : 'transform 400ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms, border-color 400ms',
                willChange: 'transform',
                position: 'relative',
              }}
            >
              {/* Top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: typeColor, opacity: isActive ? 0.8 : 0.3, transition: isReduced ? 'none' : 'opacity 400ms' }} />

              {/* Card content */}
              <div style={{ flex: 1, padding: '24px 20px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>IC-{(i + 1).toString().padStart(2, '0')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: typeColor, background: `color-mix(in srgb, ${typeColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${typeColor} 30%, transparent)`, borderRadius: 4, padding: '2px 6px' }}>{exp.type}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)' }}>{i + 1}/{experience.length}</span>
                  </div>
                </div>

                {/* Date */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{dateRange}</div>

                {/* Role */}
                <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{exp.role}</h3>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>{exp.organization}</p>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--color-border-subtle)', marginBottom: 14, flexShrink: 0 }} />

                {/* Bullets */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                    {exp.description.map((item, bi) => (
                      <li key={bi} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                        <span style={{ color: typeColor, fontSize: 11, lineHeight: '1.8', flexShrink: 0 }} aria-hidden="true">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 20, paddingTop: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {experience.map((exp, i) => {
            const typeColor = exp.type === 'work' ? 'var(--color-accent)' : 'var(--color-amber, #e8880a)';
            return (
              <button
                key={exp.id}
                type="button"
                aria-label={`Go to ${exp.organization}`}
                onClick={() => {
                  const container = scrollRef.current;
                  if (!container) return;
                  const card = container.children[i] as HTMLElement;
                  card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                style={{
                  width: activeIndex === i ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: activeIndex === i ? typeColor : 'var(--color-border-strong)',
                  transition: isReduced ? 'none' : 'all 300ms cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  flexShrink: 0,
                  boxShadow: activeIndex === i ? `0 0 8px ${typeColor}` : 'none',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          {experience[activeIndex]?.organization} · {activeIndex + 1}/{experience.length}
        </div>
      </div>
    </div>
  );
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const isReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingParenControls = useAnimationControls();
  const [headingGlowed, setHeadingGlowed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 1024);
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

  if (isMobile) {
    return (
      <SectionTransition id="experience" label="experience.exec()" zIndex={50}>
        <MobileExperienceView experience={experience} isReduced={isReduced} />
      </SectionTransition>
    );
  }

  return (
    <SectionTransition id="experience" label="experience.exec()" zIndex={50}>
      <div
        ref={sectionRef}
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '104px 48px 80px', overflow: 'hidden' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 64, alignItems: 'start' }}>

          {/* Left: heading + nav */}
          <div style={{ position: 'sticky', top: 96 }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>timeline</span>
                <motion.span animate={headingParenControls} style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', display: 'inline-block' }}>.exec()</motion.span>
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>// {experience.length} entr{experience.length === 1 ? 'y' : 'ies'}</p>
            </div>

            {/* PCB wire nav */}
            <div style={{ marginBottom: 24, padding: '0 4px' }}>
              <HorizontalPCBWire count={experience.length} activeIndex={activeIndex} isReduced={isReduced} />
            </div>

            {/* Entry list nav */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {experience.map((exp, i) => {
                const isAct = i === activeIndex;
                const typeColor = exp.type === 'work' ? 'var(--color-accent)' : 'var(--color-amber, #e8880a)';
                const yr = exp.isPresent ? `${getYear(exp.startDate)}–Now` : getYear(exp.startDate);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    data-cursor="pointer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: isAct ? `1px solid color-mix(in srgb, ${typeColor} 35%, transparent)` : '1px solid transparent',
                      background: isAct ? `color-mix(in srgb, ${typeColor} 8%, transparent)` : 'transparent',
                      cursor: 'pointer',
                      transition: isReduced ? 'none' : 'all 200ms',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isAct ? typeColor : 'var(--color-border-strong)', boxShadow: isAct ? `0 0 8px ${typeColor}` : 'none', flexShrink: 0, transition: isReduced ? 'none' : 'all 200ms' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: isAct ? 600 : 400, color: isAct ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: isReduced ? 'none' : 'color 200ms' }}>{exp.organization}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{yr}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: typeColor, background: `color-mix(in srgb, ${typeColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`, borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>{exp.type}</span>
                  </button>
                );
              })}
            </div>

            {/* Keyboard hint */}
            <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['← →', 'navigate'], ['click', 'jump to']].map(([key, desc]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-accent)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>{key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: active experience card — large and impressive */}
          <div style={{ minHeight: 480 }}>
            {experience.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-tertiary)' }}>// no experience entries yet</div>
            ) : (
              <AnimatePresence mode="wait">
                {experience[activeIndex] && (() => {
                  const exp = experience[activeIndex]!;
                  const typeColor = exp.type === 'work' ? 'var(--color-accent)' : 'var(--color-amber, #e8880a)';
                  const dateRange = exp.isPresent ? `${getYear(exp.startDate)}–Present` : `${getYear(exp.startDate)}–${exp.endDate ? getYear(exp.endDate) : ''}`;
                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: isReduced ? 0 : 32 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isReduced ? 0 : -32 }}
                      transition={isReduced ? { duration: 0.12 } : { duration: 0.3, ease: 'easeOut' }}
                      style={{
                        position: 'relative',
                        background: 'var(--color-bg-secondary)',
                        border: `1px solid color-mix(in srgb, ${typeColor} 25%, var(--color-border-default))`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: `0 0 0 1px color-mix(in srgb, ${typeColor} 8%, transparent), 0 32px 80px rgba(0,0,0,0.4)`,
                      }}
                    >
                      {/* Top accent bar */}
                      <div style={{ height: 3, background: `linear-gradient(to right, ${typeColor}, transparent)`, opacity: 0.8 }} />

                      <div style={{ padding: '40px 40px 36px' }}>
                        {/* Top metadata row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em' }}>IC-{(activeIndex + 1).toString().padStart(2, '0')}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: typeColor, background: `color-mix(in srgb, ${typeColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${typeColor} 30%, transparent)`, borderRadius: 4, padding: '2px 8px' }}>{exp.type}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>{dateRange}</span>
                        </div>

                        {/* Role + org */}
                        <div style={{ marginBottom: 32 }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 8 }}>{exp.role}</h3>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{exp.organization}</p>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: `linear-gradient(to right, color-mix(in srgb, ${typeColor} 30%, transparent), transparent)`, marginBottom: 28 }} />

                        {/* Bullets */}
                        {exp.description.length > 0 && (
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
                            {exp.description.map((item, bi) => (
                              <li key={bi} style={{ display: 'flex', gap: 12, fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                <span style={{ color: typeColor, fontSize: 13, lineHeight: '1.8', flexShrink: 0, fontWeight: 600 }} aria-hidden="true">›</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Nav arrows inside card footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px 24px', borderTop: '1px solid var(--color-border-subtle)' }}>
                        <ExpNavArrow direction="prev" onClick={() => setActiveIndex((p) => Math.max(0, p - 1))} disabled={!hasPrev} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{activeIndex + 1} / {experience.length}</span>
                        <ExpNavArrow direction="next" onClick={() => setActiveIndex((p) => Math.min(experience.length - 1, p + 1))} disabled={!hasNext} />
                      </div>

                      {/* Decorative bg element */}
                      <div aria-hidden="true" style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: typeColor, opacity: 0.04, pointerEvents: 'none' }} />
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </SectionTransition>
  );
};