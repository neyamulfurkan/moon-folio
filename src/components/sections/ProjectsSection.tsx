'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { ElectricButton } from '@/components/ui/ElectricButton';
import { cn } from '@/lib/utils';
import type { ProjectSummary, Project } from '@/types/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectsSectionProps = {
  projects: ProjectSummary[];
  onOverlayOpen?: (project: Project) => void;
  onOverlayClose?: () => void;
  externalOverlayProject?: Project | null;
};

type ProjectDetailOverlayProps = {
  project: Project | null;
  onClose: () => void;
};

// ---------------------------------------------------------------------------
// Simplified Spark hair watermark SVG (no full character overhead)
// ---------------------------------------------------------------------------

type SparkHairWatermarkProps = {
  spike: boolean;
  isReduced: boolean;
};

const SparkHairWatermark: React.FC<SparkHairWatermarkProps> = ({ spike, isReduced }) => (
  <motion.div
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 1,
      overflow: 'hidden',
    }}
  >
    <motion.svg
      viewBox="0 0 160 140"
      width={200}
      height={175}
      style={{ opacity: 0.12 }}
      animate={
        isReduced
          ? { rotate: 0 }
          : spike
          ? { rotate: [-2, 2, -1, 0] }
          : { rotate: 0 }
      }
      transition={{ duration: 0.3 }}
    >
      {/* Main hair mass */}
      <motion.path
        d="M80 110 C60 108 42 95 38 78 C34 62 40 48 48 38 C54 30 62 24 72 20 C76 18 80 17 80 17 C80 17 84 18 88 20 C98 24 106 30 112 38 C120 48 126 62 122 78 C118 95 100 108 80 110Z"
        fill="var(--color-text-secondary)"
        stroke="none"
      />
      {/* Center spike */}
      <motion.path
        d="M80 17 C78 12 76 4 80 0 C84 4 82 12 80 17Z"
        fill="var(--color-text-secondary)"
        animate={isReduced ? { scaleY: 1, y: 0 } : spike ? { scaleY: 1.6, y: -8 } : { scaleY: 1, y: 0 }}
        style={{ transformOrigin: '80px 17px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      />
      {/* Left spike */}
      <motion.path
        d="M48 38 C40 30 32 22 28 16 C36 18 44 28 48 38Z"
        fill="var(--color-text-secondary)"
        animate={isReduced ? { scaleY: 1, rotate: 0 } : spike ? { scaleY: 1.4, rotate: -8 } : { scaleY: 1, rotate: 0 }}
        style={{ transformOrigin: '48px 38px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      />
      {/* Right spike */}
      <motion.path
        d="M112 38 C120 30 128 22 132 16 C124 18 116 28 112 38Z"
        fill="var(--color-text-secondary)"
        animate={isReduced ? { scaleY: 1, rotate: 0 } : spike ? { scaleY: 1.4, rotate: 8 } : { scaleY: 1, rotate: 0 }}
        style={{ transformOrigin: '112px 38px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      />
    </motion.svg>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Arrow button
// ---------------------------------------------------------------------------

type NavArrowProps = {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
};

const NavArrow: React.FC<NavArrowProps> = ({ direction, onClick, disabled }) => (
  <button
    type="button"
    aria-label={direction === 'prev' ? 'Previous project' : 'Next project'}
    onClick={onClick}
    disabled={disabled}
    data-cursor="pointer"
    className="nav-arrow-btn"
  style={{
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [direction === 'prev' ? 'left' : 'right']: 24,
      zIndex: 20,
      background: 'rgba(7,9,15,0.6)',
      border: '1px solid var(--color-border-default)',
      borderRadius: '50%',
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 200ms, background 200ms',
    }}
    onMouseEnter={(e) => {
      if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.15)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(7,9,15,0.6)';
    }}
  >
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="var(--color-text-primary)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'prev' ? (
        <polyline points="13,4 7,10 13,16" />
      ) : (
        <polyline points="7,4 13,10 7,16" />
      )}
    </svg>
  </button>
);

// ---------------------------------------------------------------------------
// ProjectDetailOverlay
// ---------------------------------------------------------------------------

export const ProjectDetailOverlay: React.FC<ProjectDetailOverlayProps> = ({
  project,
  onClose,
}) => {
  const isReduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

  // Sanitize full description HTML client-side
  useEffect(() => {
    if (!project?.fullDesc) {
      setSanitizedHtml('');
      return;
    }
    const sanitize = async (): Promise<void> => {
      try {
        const { default: DOMPurifyLib } = await import('dompurify');
        const purify = typeof window !== 'undefined' ? DOMPurifyLib(window) : null;
        setSanitizedHtml(purify ? purify.sanitize(project.fullDesc ?? '') : '');
      } catch {
        setSanitizedHtml('');
      }
    };
    void sanitize();
  }, [project?.fullDesc]);

  // Body scroll lock — do NOT set body overflow hidden as it breaks fixed overlay scroll
  useEffect(() => {
    if (project) {
      // Store current scroll position and lock body without hiding overflow on the overlay container
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [project]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!project) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} project details`}
          initial={{ y: '100vh' }}
          animate={{ y: 0 }}
          exit={{ y: '100vh' }}
          transition={
            isReduced
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 300, damping: 35 }
          }
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: '#07090f',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >


          {/* Close button — fixed so it stays visible when overlay scrolls */}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close project details"
            onClick={onClose}
            data-cursor="pointer"
            style={{
              position: 'fixed',
              top: 20,
              right: 24,
              zIndex: 210,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>

          {/* Back button — fixed bottom-left, always visible */}
          <button
            type="button"
            onClick={onClose}
            data-cursor="pointer"
            style={{
              position: 'fixed',
              bottom: 32,
              left: 32,
              zIndex: 210,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 8,
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </button>

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 900,
              margin: '0 auto',
              padding: 'clamp(64px, 8vw, 80px) clamp(16px, 5vw, 48px) clamp(80px, 10vw, 120px)',
            }}
          >
            {/* Category + title */}
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {project.category}
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 24,
              }}
            >
              {project.title}
            </h2>

            {/* Tech stack chips */}
            {project.techStack.length > 0 && (
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}
                role="list"
                aria-label="Tech stack"
              >
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    role="listitem"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-secondary)',
                      borderRadius: 4,
                      padding: '3px 8px',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Image gallery */}
            {project.galleryUrls && project.galleryUrls.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  marginBottom: 40,
                  paddingBottom: 8,
                }}
                aria-label="Project image gallery"
              >
                {project.galleryUrls.map((url, i) => (
                  <div
                    key={url}
                    style={{
                      scrollSnapAlign: 'start',
                      flexShrink: 0,
                      width: 'clamp(240px, 60vw, 640px)',
                      aspectRatio: '16/9',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${project.title} screenshot ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Full description */}
            {sanitizedHtml && (
              <div
                // Content is sanitized by DOMPurify above
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'var(--color-text-secondary)',
                  marginBottom: 40,
                }}
              />
            )}

            {/* Challenge / Solution */}
            {(project.challenge ?? project.solution) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 32,
                  marginBottom: 40,
                }}
              >
                {project.challenge && (
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: 'var(--color-accent)',
                        marginBottom: 12,
                      }}
                    >
                      {'<'} Challenge {'>'}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 15,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.7,
                      }}
                    >
                      {project.challenge}
                    </p>
                  </div>
                )}
                {project.solution && (
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: 'var(--color-accent)',
                        marginBottom: 12,
                      }}
                    >
                      {'<'} Solution {'>'}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 15,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.7,
                      }}
                    >
                      {project.solution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {project.liveUrl && (
                <ElectricButton variant="primary" href={project.liveUrl} aria-label="View live site">
                  Live Site ↗
                </ElectricButton>
              )}
              {project.githubUrl && (
                <ElectricButton variant="ghost" href={project.githubUrl} aria-label="View GitHub repository">
                  GitHub ↗
                </ElectricButton>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------------------------------------------------------------------------
// ProjectsSection
// ---------------------------------------------------------------------------

// ── Projects mini-map bar ───────────────────────────────────────────────────

type ProjectsMiniMapProps = {
  projects: ProjectSummary[];
  activeIndex: number;
  onSelect: (i: number) => void;
  isReduced: boolean;
};

const ProjectsMiniMap: React.FC<ProjectsMiniMapProps> = ({
  projects,
  activeIndex,
  onSelect,
  isReduced,
}) => (
  <div
    role="tablist"
    aria-label="Project navigation map"
    style={{
      position: 'absolute',
      top: 72,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 15,
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      background: 'rgba(13,17,23,0.82)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid var(--color-border-default)',
      borderRadius: '8px',
      padding: '6px 10px',
      maxWidth: 'calc(100vw - 160px)',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    {projects.map((project, i) => {
      const isActive = i === activeIndex;
      return (
        <button
          key={project.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-label={`Go to project: ${project.title}`}
          onClick={() => onSelect(i)}
          data-cursor="pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '5px',
            border: 'none',
            background: isActive
              ? 'rgba(0,212,255,0.14)'
              : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: isReduced ? 'none' : 'background 180ms',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              width: isActive ? 7 : 5,
              height: isActive ? 7 : 5,
              borderRadius: '50%',
              background: isActive
                ? 'var(--color-accent)'
                : 'var(--color-border-strong)',
              boxShadow: isActive ? '0 0 6px var(--color-accent)' : 'none',
              flexShrink: 0,
              transition: isReduced ? 'none' : 'all 200ms',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.04em',
              color: isActive
                ? 'var(--color-accent)'
                : 'var(--color-text-tertiary)',
              fontWeight: isActive ? 500 : 400,
              transition: isReduced ? 'none' : 'color 180ms',
              maxWidth: '110px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.title}
          </span>
        </button>
      );
    })}
    {/* count badge */}
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
      {activeIndex + 1}/{projects.length}
    </div>
  </div>
);

// ── ProjectsSection ─────────────────────────────────────────────────────────

const MobileProjectsView: React.FC<{
  projects: ProjectSummary[];
  onViewDetails: (project: ProjectSummary) => void;
  isReduced: boolean;
}> = ({ projects, onViewDetails, isReduced }) => {
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
  }, [projects]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
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
          gap: 0,
          paddingBottom: 0,
        }}
      >
        <style>{`.mobile-snap-container::-webkit-scrollbar { display: none; }`}</style>
        {projects.map((project, i) => (
          <MobileProjectCard
            key={project.id}
            project={project}
            isActive={activeIndex === i}
            index={i}
            total={projects.length}
            onViewDetails={() => onViewDetails(project)}
            isReduced={isReduced}
          />
        ))}
      </div>

      {/* Bottom bar: dots + swipe hint */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 20,
          paddingTop: 8,
        }}
      >
        {/* Swipe hint — only show when multiple projects */}
        {projects.length > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
              opacity: activeIndex === 0 ? 1 : 0,
              transition: isReduced ? 'none' : 'opacity 400ms',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 7H5M5 7L7 5M5 7L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 7H9M9 7L7 5M9 7L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,0)" opacity="0"/>
            </svg>
            swipe to explore {projects.length} projects
          </div>
        )}

        {/* Dots */}
        {projects.length > 1 && (
          <div
            aria-label={`Project ${activeIndex + 1} of ${projects.length}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Go to project ${i + 1}: ${p.title}`}
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
        )}

        {/* Single project label */}
        {projects.length === 1 && (
          <div
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
            }}
          >
            // 1 project
          </div>
        )}
      </div>
    </div>
  );
};

const MobileProjectCard: React.FC<{
  project: ProjectSummary;
  isActive: boolean;
  index: number;
  total: number;
  onViewDetails: () => void;
  isReduced: boolean;
}> = ({ project, isActive, index, total, onViewDetails, isReduced }) => {
  const cloudinaryUrl = project.thumbnailUrl
    ? project.thumbnailUrl.includes('res.cloudinary.com')
      ? project.thumbnailUrl.replace('/upload/', '/upload/w_800,h_600,c_fill,f_auto,q_auto/')
      : project.thumbnailUrl
    : null;

  return (
    <div
      style={{
        scrollSnapAlign: 'center',
        flexShrink: 0,
        width: 'calc(100vw - 48px)',
        marginLeft: index === 0 ? '24px' : '12px',
        marginRight: index === total - 1 ? '24px' : '12px',
        height: 'calc(100% - 16px)',
        maxHeight: 560,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-secondary)',
        border: isActive
          ? '1px solid rgba(0,212,255,0.35)'
          : '1px solid var(--color-border-default)',
        boxShadow: isActive
          ? '0 0 0 1px rgba(0,212,255,0.1), 0 24px 64px rgba(0,0,0,0.7)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        transform: isActive ? 'scale(1)' : 'scale(0.94)',
        transition: isReduced ? 'none' : 'transform 400ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms, border-color 400ms',
        willChange: 'transform',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', flexShrink: 0 }}>
        {cloudinaryUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--color-bg-tertiary) 0%, var(--color-bg-primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>no preview</span>
          </div>
        )}
        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span
            style={{
              background: 'rgba(7,9,15,0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 6,
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {project.category}
          </span>
          {project.featured && (
            <span
              style={{
                background: 'rgba(0,212,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: 6,
                padding: '3px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-accent)',
              }}
            >
              ★
            </span>
          )}
        </div>
        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(7,9,15,0.7)',
            backdropFilter: 'blur(6px)',
            borderRadius: 6,
            padding: '3px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
          }}
        >
          {index + 1}/{total}
        </div>
        {/* Cyan line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
            opacity: isActive ? 0.8 : 0.2,
            transition: isReduced ? 'none' : 'opacity 400ms',
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(17px, 4.5vw, 21px)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {project.title}
        </h2>
        {project.shortDesc && (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.55,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.shortDesc}
          </p>
        )}
        {/* Tech chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
                borderRadius: 4,
                padding: '2px 6px',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', padding: '2px 4px' }}>
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <button
            type="button"
            onClick={onViewDetails}
            data-cursor="pointer"
            style={{
              width: '100%',
              padding: '13px 0',
              background: 'var(--color-accent)',
              color: 'var(--color-bg-primary)',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, onOverlayOpen, externalOverlayProject }) => {
  const isReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);
  const [hairSpike, setHairSpike] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [overlayError, setOverlayError] = useState(false);

  // Use external overlay if provided
  const effectiveOverlayProject = externalOverlayProject !== undefined ? externalOverlayProject : overlayProject;

  const projectCacheRef = useRef<Map<string, Project>>(new Map());
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  const hairSpikeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // keep onOverlayOpen in a ref so handleViewDetails never goes stale
  const onOverlayOpenRef = useRef(onOverlayOpen);
  useEffect(() => { onOverlayOpenRef.current = onOverlayOpen; }, [onOverlayOpen]);

  const triggerHairSpike = useCallback((): void => {
    if (isReduced) return;
    if (hairSpikeTimerRef.current) clearTimeout(hairSpikeTimerRef.current);
    setHairSpike(true);
    hairSpikeTimerRef.current = setTimeout(() => {
      setHairSpike(false);
    }, 300);
  }, [isReduced]);

  const navigate = useCallback(
    (dir: 'prev' | 'next'): void => {
      setActiveProjectIndex((prev) => {
        const next =
          dir === 'next'
            ? Math.min(prev + 1, projects.length - 1)
            : Math.max(prev - 1, 0);
        if (next !== prev) triggerHairSpike();
        return next;
      });
    },
    [projects.length, triggerHairSpike]
  );

  // Keyboard navigation (scoped to section visibility)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry?.isIntersecting ?? false;
      },
      { threshold: 0.3 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isVisibleRef.current) return;
      if (overlayProject) return;
      if (e.key === 'ArrowLeft') navigate('prev');
      else if (e.key === 'ArrowRight') navigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, overlayProject]);

  // Cleanup hair spike timer
  useEffect(() => {
    return () => {
      if (hairSpikeTimerRef.current) clearTimeout(hairSpikeTimerRef.current);
    };
  }, []);

  const handleViewDetails = useCallback(
    async (project: ProjectSummary): Promise<void> => {
      const cached = projectCacheRef.current.get(project.slug);
      if (cached) {
        setOverlayError(false);
        if (onOverlayOpenRef.current) {
          onOverlayOpenRef.current(cached);
        } else {
          setOverlayProject(cached);
        }
        return;
      }

      setOverlayLoading(true);
      setOverlayError(false);

      try {
        const res = await fetch(`/api/projects/${project.slug}`);
        if (!res.ok) {
          setOverlayError(true);
          setOverlayLoading(false);
          return;
        }
        const json = (await res.json()) as { data: Project } | { error: string };
        if ('error' in json) {
          setOverlayError(true);
          setOverlayLoading(false);
          return;
        }
        projectCacheRef.current.set(project.slug, json.data);
        if (onOverlayOpenRef.current) {
          onOverlayOpenRef.current(json.data);
        } else {
          setOverlayProject(json.data);
        }
      } catch {
        setOverlayError(true);
      } finally {
        setOverlayLoading(false);
      }
    },
    []
  );

  const handleCloseOverlay = useCallback((): void => {
    setOverlayProject(null);
    setOverlayError(false);
  }, []);

  const handleExternalClose = useCallback((): void => {
    setOverlayProject(null);
    setOverlayError(false);
  }, []);

  const hasMultiple = projects.length > 1;
  const activeProject = projects[activeProjectIndex];

  // Empty state
  if (projects.length === 0) {
    return (
      <SectionTransition id="projects" label="projects" zIndex={40}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 48,
          }}
        >
          <svg
            viewBox="0 0 240 200"
            width={200}
            height={166}
            aria-hidden="true"
            style={{ opacity: 0.3 }}
          >
            {/* Monitor with empty screen */}
            <rect x="40" y="20" width="160" height="110" rx="8" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" />
            <rect x="50" y="30" width="140" height="90" rx="4" fill="var(--color-bg-secondary)" />
            <rect x="100" y="130" width="40" height="20" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" />
            <rect x="80" y="150" width="80" height="6" rx="3" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" />
            {/* Question mark on screen */}
            <text x="120" y="83" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="28" fill="var(--color-text-tertiary)">?</text>
          </svg>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: 'var(--color-text-tertiary)',
              textAlign: 'center',
            }}
          >
            // projects coming soon
          </p>
        </div>
      </SectionTransition>
    );
  }

  if (isMobile) {
    return (
      <SectionTransition id="projects" label="projects" zIndex={40}>
        <MobileProjectsView
          projects={projects}
          onViewDetails={(project) => { void handleViewDetails(project); }}
          isReduced={isReduced}
        />
        {onOverlayOpen === undefined && (
          <ProjectDetailOverlay
            project={effectiveOverlayProject ?? null}
            onClose={handleCloseOverlay}
          />
        )}
      </SectionTransition>
    );
  }

  return (
    <SectionTransition id="projects" label="projects" zIndex={40}>
      <div
        ref={sectionRef}
        style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', paddingTop: '64px' }}
        className="projects-section-root"
      data-section="projects"
      >
      <style>{`
        @media (max-width: 768px) {
          .projects-section-root .nav-arrow-btn { display: none !important; }
          .projects-section-root .keyboard-hint { display: none !important; }
        }
      `}</style>
        {/* Spark hair watermark — hidden when overlay is open */}
        {!overlayProject && <SparkHairWatermark spike={hairSpike} isReduced={isReduced} />}

        {/* ── Projects mini-map ── */}
        {hasMultiple && (
          <ProjectsMiniMap
            projects={projects}
            activeIndex={activeProjectIndex}
            onSelect={(i) => {
              if (i !== activeProjectIndex) {
                triggerHairSpike();
                setActiveProjectIndex(i);
              }
            }}
            isReduced={isReduced}
          />
        )}

        {/* Project cards */}
        {projects.map((project, i) => (
          <div
            key={project.id}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: activeProjectIndex === i ? 5 : 2,
            }}
          >
            <ProjectCard
              project={project}
              isActive={activeProjectIndex === i}
              onViewDetails={() => {
                void handleViewDetails(project);
              }}
            />
          </div>
        ))}

        {/* View Details loading/error overlay (on button area) */}
        {(overlayLoading || overlayError) && (
          <div
            style={{
              position: 'absolute',
              bottom: 120,
              left: 48,
              zIndex: 15,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: overlayError ? 'var(--color-danger, #ff4d4f)' : 'var(--color-text-tertiary)',
            }}
          >
            {overlayLoading && '// loading...'}
            {overlayError && '// failed to load project — try again'}
          </div>
        )}

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <NavArrow
              direction="prev"
              onClick={() => navigate('prev')}
              disabled={activeProjectIndex === 0}
            />
            <NavArrow
              direction="next"
              onClick={() => navigate('next')}
              disabled={activeProjectIndex === projects.length - 1}
            />
          </>
        )}

        {/* Indicator dots — bottom, smaller role since mini-map is primary */}
        {hasMultiple && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {projects.map((project, i) => (
              <span
                key={project.id}
                style={{
                  display: 'block',
                  borderRadius: '50%',
                  background:
                    activeProjectIndex === i
                      ? 'var(--color-accent)'
                      : 'var(--color-border-default)',
                  width: activeProjectIndex === i ? 6 : 4,
                  height: activeProjectIndex === i ? 6 : 4,
                  transition: isReduced
                    ? 'none'
                    : 'width 200ms, height 200ms, background 200ms',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Keyboard hint */}
        {hasMultiple && (
          <div
            aria-hidden="true"
            className="keyboard-hint"
            style={{
              position: 'absolute',
              bottom: 32,
              right: 24,
              zIndex: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <span>← →</span>
            <span>navigate</span>
          </div>
        )}
      </div>

      {/* Detail overlay — only render here if no external handler */}
      {onOverlayOpen === undefined && (
        <ProjectDetailOverlay
          project={overlayProject}
          onClose={handleCloseOverlay}
        />
      )}
    </SectionTransition>
  );
};