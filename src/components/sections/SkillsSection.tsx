'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const check = (): void => setIsMobile(window.innerWidth < 768);
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
        className="min-h-screen flex flex-col items-center justify-center px-6" style={{ paddingTop: '96px', paddingBottom: '96px' }}
      >
        {/* Section heading */}
        <div className="w-full max-w-5xl mb-12">
          <h2
            className="text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>skills</span>
            <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              .deck
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              ()
            </span>
          </h2>
          <p
            className="text-sm font-mono"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {/* keyboard hint */}
            <span className="hidden md:inline">← → to navigate · </span>
            click a category to jump
          </p>
        </div>

        {/* Category chips */}
        <div className="w-full max-w-5xl flex flex-wrap gap-2 mb-10">
          {SKILL_CATEGORIES.map((cat, idx) => {
            const isActive = idx === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => goToCategory(idx as 0 | 1 | 2 | 3)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase',
                  'border transition-colors duration-150',
                  isActive
                    ? 'border-transparent'
                    : 'border-transparent bg-transparent'
                )}
                style={{
                  background: isActive
                    ? 'var(--color-accent-dim)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-text-tertiary)',
                  borderColor: isActive
                    ? 'transparent'
                    : 'var(--color-border-subtle)',
                }}
                aria-pressed={isActive}
                aria-label={`Switch to ${CATEGORY_LABELS[cat] ?? cat} skills`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            );
          })}
        </div>

        {/* Card deck */}
        <div
          className="w-full max-w-5xl"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative"
            style={{
              height: 320,
              width: 480,
              maxWidth: '100%',
            }}
            role="region"
            aria-label="Skills card deck"
          >
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
        </div>

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:flex items-center gap-6 mt-10">
          <button
            onClick={() => navigate('left')}
            className="w-10 h-10 flex items-center justify-center rounded-full border transition-colors duration-150"
            style={{
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Previous skill category"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Position dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Skill categories">
            {SKILL_CATEGORIES.map((cat, idx) => (
              <button
                key={cat}
                role="tab"
                aria-selected={idx === activeCategory}
                aria-label={CATEGORY_LABELS[cat] ?? cat}
                onClick={() => goToCategory(idx as 0 | 1 | 2 | 3)}
                style={{
                  width: idx === activeCategory ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    idx === activeCategory
                      ? 'var(--color-accent)'
                      : 'var(--color-border-default)',
                  transition: isReduced
                    ? 'none'
                    : 'width 0.2s ease, background 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={() => navigate('right')}
            className="w-10 h-10 flex items-center justify-center rounded-full border transition-colors duration-150"
            style={{
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Next skill category"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile position dots */}
        <div
          className="flex md:hidden items-center gap-2 mt-8"
          role="tablist"
          aria-label="Skill categories"
        >
          {SKILL_CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              role="tab"
              aria-selected={idx === activeCategory}
              aria-label={CATEGORY_LABELS[cat] ?? cat}
              onClick={() => goToCategory(idx as 0 | 1 | 2 | 3)}
              style={{
                width: idx === activeCategory ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  idx === activeCategory
                    ? 'var(--color-accent)'
                    : 'var(--color-border-default)',
                transition: isReduced
                  ? 'none'
                  : 'width 0.2s ease, background 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </SectionTransition>
  );
};