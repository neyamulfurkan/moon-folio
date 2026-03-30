'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ElectricButton } from '@/components/ui/ElectricButton';
import { cn } from '@/lib/utils';
import type { ProjectSummary } from '@/types/index';

type ProjectCardProps = {
  project: ProjectSummary;
  isActive: boolean;
  onViewDetails: () => void;
};

const MAX_CHIPS = 3;

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  onViewDetails,
}) => {
  const isReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const prevActiveRef = useRef(isActive);
  const prevProjectIdRef = useRef(project.id);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const projectChanged = prevProjectIdRef.current !== project.id;
    const activeChanged = prevActiveRef.current !== isActive;

    if ((projectChanged || activeChanged) && isActive) {
      if (!isReduced) {
        // Clear any running flash
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        setFlashVisible(true);
        setFlashOpacity(0);

        rafRef.current = requestAnimationFrame(() => {
          setFlashOpacity(0.6);
          flashTimerRef.current = setTimeout(() => {
            setFlashOpacity(0);
            flashTimerRef.current = setTimeout(() => {
              setFlashVisible(false);
            }, 30);
          }, 30);
        });
      }
    }

    prevActiveRef.current = isActive;
    prevProjectIdRef.current = project.id;
  }, [isActive, project.id, isReduced]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const hasImage = Boolean(project.thumbnailUrl);

  const cloudinaryUrl = hasImage
    ? (() => {
        const url = project.thumbnailUrl as string;
        if (!url.includes('res.cloudinary.com')) return url;
        // Use smaller size for mobile, larger for desktop via Cloudinary
        return url.replace('/upload/', '/upload/w_1200,h_800,c_fill,f_auto,q_auto/');
      })()
    : null;

  const visibleChips = project.techStack.slice(0, MAX_CHIPS);
  const extraCount = project.techStack.length - MAX_CHIPS;

  const titleTooLong = project.title.length > 40;

  return (
    <div
      className={cn(
        'relative w-full',
        'transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{ height: '100vh' }}
    >
      {isMobile ? (
        /* ── MOBILE: card-swipe layout ── */
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 16px 48px',
            gap: 0,
          }}
        >
          {/* Card */}
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.15)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-bg-secondary)',
              flex: '0 0 auto',
            }}
          >
            {/* Image — top 52% */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {cloudinaryUrl ? (
                <Image
                  src={cloudinaryUrl}
                  alt={project.title}
                  fill
                  priority={isActive}
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                  quality={85}
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
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-tertiary)' }}>no preview</span>
                </div>
              )}
              {/* Category pill on image */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(7,9,15,0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0,212,255,0.2)',
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
              </div>
              {/* Featured badge */}
              {project.featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,212,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-accent)',
                    letterSpacing: '0.06em',
                  }}
                >
                  ★ featured
                </div>
              )}
              {/* Cyan accent line at bottom of image */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
                  opacity: 0.7,
                }}
              />
            </div>

            {/* Info panel */}
            <div
              style={{
                padding: '20px 20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Title */}
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 5vw, 22px)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {project.title}
              </h2>

              {/* Short desc */}
              {project.shortDesc && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
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
              {project.techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {visibleChips.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-secondary)',
                        borderRadius: 4,
                        padding: '2px 7px',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-text-tertiary)',
                        padding: '2px 4px',
                      }}
                    >
                      +{extraCount}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onViewDetails}
                  aria-label={`View details for ${project.title}`}
                  data-cursor="pointer"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg-primary)',
                    border: 'none',
                    borderRadius: 10,
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Background image or fallback */}
      {cloudinaryUrl ? (
        <Image
          src={cloudinaryUrl}
          alt={project.title}
          fill
          priority={isActive}
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          quality={85}
        />
      ) : (
        /* Fallback gradient background */
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)',
          }}
        />
      )}

      {/* Gradient overlay — covers left side for text readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none project-image-overlay"
        style={{
          background:
            'linear-gradient(to right, var(--color-bg-primary) 0%, var(--color-bg-primary) 40%, rgba(7,9,15,0.85) 60%, rgba(7,9,15,0.4) 80%, transparent 100%)',
        }}
      />

      {/* Fallback centered title when no image */}
      {!cloudinaryUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-display font-semibold text-center px-8"
            style={{
              fontSize: 'clamp(24px, 5vw, 64px)',
              color: 'var(--color-text-tertiary)',
              opacity: 0.15,
            }}
          >
            {project.title}
          </span>
        </div>
      )}

      {/* Info column */}
      <div
        className="absolute flex flex-col gap-4 project-info-col"
        style={{
          left: 'clamp(16px, 5vw, 48px)',
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: 'min(520px, calc(100vw - 32px))',
          paddingRight: 16,
        }}
      >
        {/* Category badge */}
        <span
          className="font-mono tracking-widest uppercase"
          style={{
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.12em',
          }}
        >
          {project.category}
        </span>

        {/* Project title */}
        <h2
          className="font-display font-semibold leading-tight"
          style={{
            fontSize: 'clamp(22px, 5vw, 40px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            color: 'var(--color-text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: titleTooLong ? 2 : undefined,
            WebkitBoxOrient: titleTooLong ? 'vertical' : undefined,
            overflow: titleTooLong ? 'hidden' : undefined,
          }}
        >
          {project.title}
        </h2>

        {/* Short description */}
        {project.shortDesc && (
          <p
            className="font-display leading-relaxed"
            style={{
              fontSize: 'clamp(13px, 2vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: 480,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            {project.shortDesc}
          </p>
        )}

        {/* Tech stack chips */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2" role="list" aria-label="Tech stack">
            {visibleChips.map((tech) => (
              <span
                key={tech}
                role="listitem"
                className="font-mono"
                style={{
                  fontSize: 12,
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {tech}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                role="listitem"
                className="font-mono"
                style={{
                  fontSize: 12,
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-tertiary)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        {/* View Details CTA */}
        <div className="mt-2">
          <ElectricButton
            variant="primary"
            onClick={onViewDetails}
            aria-label={`View details for ${project.title}`}
          >
            View Details
          </ElectricButton>
        </div>
      </div>

        </>
      )} {/* end mobile/desktop conditional */}

      {/* Mini-shock flash overlay */}
      {flashVisible && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: '#ffffff',
            opacity: flashOpacity,
            transition: isReduced
              ? 'none'
              : 'opacity 30ms ease-in-out',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};