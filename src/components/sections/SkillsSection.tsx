'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { SkillCard } from '@/components/ui/SkillCard';
import { SKILL_CATEGORIES } from '@/lib/constants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { Skill } from '@/types/index';

type SkillsSectionProps = {
  skills: Skill[];
};

const MAX_SKILLS_PER_CARD = 8;

const CATEGORY_LABELS: Record<string, string> = {
  web: 'Web',
  hardware: 'Hardware',
  tools: 'Tools',
  learning: 'Learning',
};

const EmptyCardContent: React.FC<{ category: string }> = ({ category }) => (
  <div className="flex items-center justify-center h-full">
    <p
      className="text-sm font-mono"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      No {CATEGORY_LABELS[category] ?? category} skills yet
    </p>
  </div>
);

const MobileSkillsView: React.FC<{
  groupedSkills: Record<string, Skill[]>;
  isReduced: boolean;
}> = ({ groupedSkills, isReduced }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const categories = SKILL_CATEGORIES as unknown as string[];

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
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 12px', flexShrink: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>skills</span>
          <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>.deck()</span>
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 6, letterSpacing: '0.06em' }}>
          swipe to explore {categories.length} categories
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
          paddingBottom: 0,
        }}
      >
        {categories.map((cat, i) => {
          const catSkills = groupedSkills[cat] ?? [];
          const isActive = i === activeIndex;
          const label = CATEGORY_LABELS[cat] ?? cat;
          return (
            <div
              key={cat}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                width: 'calc(100vw - 48px)',
                marginLeft: i === 0 ? '24px' : '12px',
                marginRight: i === categories.length - 1 ? '24px' : '12px',
                height: 'calc(100% - 16px)',
                maxHeight: 520,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-secondary)',
                border: isActive ? '1px solid rgba(0,212,255,0.35)' : '1px solid var(--color-border-default)',
                boxShadow: isActive ? '0 0 0 1px rgba(0,212,255,0.1), 0 24px 64px rgba(0,0,0,0.7)' : '0 8px 32px rgba(0,0,0,0.4)',
                transform: isActive ? 'scale(1)' : 'scale(0.94)',
                transition: isReduced ? 'none' : 'transform 400ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms, border-color 400ms',
                willChange: 'transform',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '2px 8px' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{i + 1}/{categories.length}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>{catSkills.length} skill{catSkills.length !== 1 ? 's' : ''}</div>
                {/* Cyan accent line */}
                <div style={{ marginTop: 12, height: 2, background: 'linear-gradient(to right, var(--color-accent), transparent)', opacity: isActive ? 0.7 : 0.2, transition: isReduced ? 'none' : 'opacity 400ms', borderRadius: 1 }} />
              </div>

              {/* Skills list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {catSkills.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-tertiary)' }}>// no skills yet</div>
                ) : (
                  catSkills.map((skill) => (
                    <div
                      key={skill.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 10,
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{skill.name}</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {Array.from({ length: 5 }).map((_, li) => (
                          <div
                            key={li}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: li < skill.proficiency ? 'var(--color-accent)' : 'var(--color-border-default)',
                              boxShadow: li < skill.proficiency ? '0 0 4px var(--color-accent)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 20, paddingTop: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {categories.map((cat, i) => (
            <button
              key={cat}
              type="button"
              aria-label={`Go to ${CATEGORY_LABELS[cat] ?? cat}`}
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
                background: activeIndex === i ? 'var(--color-accent)' : 'var(--color-border-strong)',
                transition: isReduced ? 'none' : 'all 300ms cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                flexShrink: 0,
                boxShadow: activeIndex === i ? '0 0 8px var(--color-accent)' : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          {CATEGORY_LABELS[categories[activeIndex] ?? ''] ?? categories[activeIndex]} · {activeIndex + 1}/{categories.length}
        </div>
      </div>
    </div>
  );
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [activeCategory, setActiveCategory] = useState<0 | 1 | 2 | 3>(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const isReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisibleRef = useRef(false);
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);

  // Group skills by category preserving SKILL_CATEGORIES order
  const groupedSkills = useMemo<Record<string, Skill[]>>(() => {
    const groups: Record<string, Skill[]> = {};
    for (const cat of SKILL_CATEGORIES) {
      groups[cat] = [];
    }
    for (const skill of skills) {
      if (groups[skill.category] !== undefined) {
        groups[skill.category]!.push(skill);
      }
    }
    return groups;
  }, [skills]);

  const navigate = useCallback(
    (dir: 'left' | 'right') => {
      setDirection(dir);
      setActiveCategory((prev) => {
        const next =
          dir === 'right'
            ? ((prev + 1) % 4) as 0 | 1 | 2 | 3
            : ((prev + 3) % 4) as 0 | 1 | 2 | 3;
        return next;
      });
    },
    []
  );

  const goToCategory = useCallback(
    (index: 0 | 1 | 2 | 3) => {
      setDirection(index > activeCategory ? 'right' : 'left');
      setActiveCategory(index);
    },
    [activeCategory]
  );

  // IntersectionObserver for keyboard navigation scope
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionVisibleRef.current = entry?.isIntersecting ?? false;
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isSectionVisibleRef.current) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Touch/swipe navigation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, time: Date.now() };
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - touchStartRef.current.x;
      const dt = Date.now() - touchStartRef.current.time;
      const velocity = Math.abs(dx) / dt;

      if (Math.abs(dx) >= 50 && velocity > 0.3) {
        navigate(dx < 0 ? 'right' : 'left');
      }

      touchStartRef.current = null;
    };

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  // Compute stack positions for each category
  const getStackPosition = (categoryIndex: number): 0 | 1 | 2 | 3 => {
    const offset = (categoryIndex - activeCategory + 4) % 4;
    return offset as 0 | 1 | 2 | 3;
  };

  if (isMobile) {
    return (
      <SectionTransition id="skills" label="skills" zIndex={30} bgColor="primary">
        <MobileSkillsView groupedSkills={groupedSkills} isReduced={isReduced} />
      </SectionTransition>
    );
  }

  return (
    <SectionTransition
      id="skills"
      label="skills"
      zIndex={30}
      bgColor="primary"
    >
      <div
        ref={sectionRef}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '104px 48px 80px' }}
      >
        {/* ── Desktop: two-column layout ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64, alignItems: 'start' }}>

          {/* Left: heading + category nav */}
          <div style={{ position: 'sticky', top: 96 }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>skills</span>
                <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>.deck()</span>
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>← → to navigate</p>
            </div>

            {/* Category nav — vertical list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} role="tablist" aria-label="Skill categories">
              {SKILL_CATEGORIES.map((cat, idx) => {
                const isActiveCat = idx === activeCategory;
                const catSkills = groupedSkills[cat] ?? [];
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActiveCat}
                    onClick={() => goToCategory(idx as 0 | 1 | 2 | 3)}
                    data-cursor="pointer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: isActiveCat ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                      background: isActiveCat ? 'rgba(0,212,255,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: isReduced ? 'none' : 'all 200ms',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActiveCat ? 'var(--color-accent)' : 'var(--color-border-strong)', boxShadow: isActiveCat ? '0 0 8px var(--color-accent)' : 'none', transition: isReduced ? 'none' : 'all 200ms', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: isActiveCat ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: isActiveCat ? 500 : 400, transition: isReduced ? 'none' : 'color 200ms' }}>{CATEGORY_LABELS[cat] ?? cat}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActiveCat ? 'var(--color-accent)' : 'var(--color-text-tertiary)', background: isActiveCat ? 'rgba(0,212,255,0.12)' : 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', borderRadius: 4, padding: '1px 6px', transition: isReduced ? 'none' : 'all 200ms' }}>{catSkills.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Keyboard hint */}
            <div style={{ marginTop: 32, padding: '12px 16px', background: 'var(--color-bg-secondary)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 6, letterSpacing: '0.06em' }}>// navigation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['← →', 'switch category'], ['click', 'select category']].map(([key, desc]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-accent)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>{key}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: active category skills grid */}
          <div style={{ minHeight: 500 }}>
            {SKILL_CATEGORIES.map((cat, idx) => {
              if (idx !== activeCategory) return null;
              const catSkills = groupedSkills[cat] ?? [];
              const label = CATEGORY_LABELS[cat] ?? cat;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: isReduced ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={isReduced ? { duration: 0.1 } : { duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Category header */}
                  <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>// {label.toLowerCase()}_skills</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>{label}</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>{catSkills.length}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>skill{catSkills.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    {/* Accent bar */}
                    <div style={{ marginTop: 16, height: 2, background: 'linear-gradient(to right, var(--color-accent), transparent)', borderRadius: 1 }} />
                  </div>

                  {/* Skills grid */}
                  {catSkills.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-tertiary)' }}>// no {label.toLowerCase()} skills yet</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {catSkills.map((skill, si) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, y: isReduced ? 0 : 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={isReduced ? { duration: 0.1 } : { duration: 0.25, delay: si * 0.04, ease: 'easeOut' }}
                          style={{
                            padding: '20px',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-default)',
                            borderRadius: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: isReduced ? 'none' : 'border-color 200ms, box-shadow 200ms',
                          }}
                          whileHover={isReduced ? {} : { borderColor: 'rgba(0,212,255,0.3)', boxShadow: '0 0 0 1px rgba(0,212,255,0.1), 0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                          {/* Skill name */}
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{skill.name}</div>

                          {/* LED proficiency */}
                          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                            {Array.from({ length: 5 }).map((_, li) => (
                              <div
                                key={li}
                                style={{
                                  width: li < skill.proficiency ? 10 : 6,
                                  height: 6,
                                  borderRadius: 3,
                                  background: li < skill.proficiency ? 'var(--color-accent)' : 'var(--color-border-default)',
                                  boxShadow: li < skill.proficiency ? '0 0 6px var(--color-accent)' : 'none',
                                  transition: isReduced ? 'none' : 'all 300ms',
                                }}
                              />
                            ))}
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginLeft: 4 }}>{skill.proficiency}/5</span>
                          </div>

                          {/* Category tag */}
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>{cat}.{skill.name.toLowerCase().replace(/\s+/g, '_')}</div>

                          {/* Decorative corner */}
                          <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, overflow: 'hidden', opacity: 0.15 }}>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent)' }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </SectionTransition>
  );
};

// Unused legacy deck kept for reference only
const _UnusedDeck: React.FC<{ groupedSkills: Record<string, Skill[]>; getStackPosition: (i: number) => 0|1|2|3; navigate: (d: 'left'|'right') => void; activeCategory: number; isReduced: boolean }> = ({ groupedSkills, getStackPosition, navigate, activeCategory, isReduced }) => (
  <div style={{ display: 'none' }}>
    {SKILL_CATEGORIES.map((cat, categoryIndex) => {
              const stackPosition = getStackPosition(categoryIndex);
              const categorySkills = groupedSkills[cat] ?? [];
              const visibleSkills = categorySkills.slice(0, MAX_SKILLS_PER_CARD);
              const isCurrentlyActive = stackPosition === 0;
              const isLearning = cat === 'learning';

              // Empty category placeholder
              if (categorySkills.length === 0) {
                const transform =
                  stackPosition === 0
                    ? { x: 0, rotate: 0, scale: 1 }
                    : stackPosition === 1
                      ? { x: 40, rotate: 3, scale: 0.96 }
                      : stackPosition === 2
                        ? { x: 70, rotate: 5, scale: 0.92 }
                        : { x: 100, rotate: 7, scale: 0.88 };

return (
              <div
                key={cat}
                onClick={() =>
                  stackPosition === 1
                    ? navigate('right')
                    : undefined
                }
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: stackPosition === 0 ? 4 : stackPosition === 1 ? 3 : stackPosition === 2 ? 2 : 1,
                  transform: isReduced
                        ? 'none'
                        : `translateX(${transform.x}px) rotate(${transform.rotate}deg) scale(${transform.scale})`,
                      transformOrigin: 'bottom center',
                      pointerEvents: stackPosition === 3 ? 'none' : 'auto',
                      cursor: stackPosition === 1 ? 'pointer' : 'default',
                      transition: isReduced
                        ? 'none'
                        : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      background: isLearning
                        ? 'repeating-linear-gradient(45deg, var(--color-bg-secondary) 0px, var(--color-bg-secondary) 6px, var(--color-bg-tertiary, var(--color-bg-secondary)) 6px, var(--color-bg-tertiary, var(--color-bg-secondary)) 12px)'
                        : 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 12,
                    }}
                    aria-hidden={stackPosition !== 0}
                  >
                    <EmptyCardContent category={cat} />
                  </div>
                );
              }

              // Render each skill in the category as a layered card stack
              // Use the first skill as the representative card for the category
              const representativeSkill = visibleSkills[0];
              if (!representativeSkill) return null;

              return (
                <div
                  key={cat}
                  onClick={() => {
                    if (stackPosition === 1) navigate('right');
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    cursor: stackPosition === 1 ? 'pointer' : 'default',
                    pointerEvents: stackPosition === 3 ? 'none' : 'auto',
                    zIndex: stackPosition === 0 ? 4 : stackPosition === 1 ? 3 : stackPosition === 2 ? 2 : 1,
                  }}
                  aria-hidden={!isCurrentlyActive}
                  role={stackPosition === 1 ? 'button' : undefined}
                  aria-label={
                    stackPosition === 1
                      ? `Switch to ${CATEGORY_LABELS[cat] ?? cat} skills`
                      : undefined
                  }
                  tabIndex={stackPosition === 1 ? 0 : undefined}
                  onKeyDown={
                    stackPosition === 1
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('right');
                          }
                        }
                      : undefined
                  }
                >
                  {/* Learning category: diagonal stripe overlay */}
                  {isLearning && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 12,
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(255,255,255,0.015) 8px, rgba(255,255,255,0.015) 16px)',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  <SkillCard
                    skill={representativeSkill}
                    index={categoryIndex}
                    isActive={isCurrentlyActive}
                    stackPosition={stackPosition}
                  />

                  {/* Multi-skill indicator for active card */}
                  {isCurrentlyActive && visibleSkills.length > 1 && (
                    <div
                      className="absolute bottom-16 left-6 right-6"
                      style={{ zIndex: 10 }}
                    >
                      <div
                        className="flex flex-wrap gap-1 mt-2"
                        role="list"
                        aria-label={`All ${CATEGORY_LABELS[cat] ?? cat} skills`}
                      >
                        {visibleSkills.slice(1).map((s) => (
                          <span
                            key={s.id}
                            role="listitem"
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{
                              background: 'var(--color-bg-primary)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                            }}
                          >
                            {s.name}
                          </span>
                        ))}
                        {categorySkills.length > MAX_SKILLS_PER_CARD && (
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{
                              background: 'var(--color-bg-primary)',
                              color: 'var(--color-text-tertiary)',
                              border: '1px solid var(--color-border-subtle)',
                            }}
                          >
                            +{categorySkills.length - MAX_SKILLS_PER_CARD} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
  </div>
);

