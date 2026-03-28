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

const MAX_CHIPS = 5;

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  onViewDetails,
}) => {
  const isReduced = useReducedMotion();
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

  const hasImage = Boolean(project.thumbnailUrl);

  const cloudinaryUrl = hasImage
    ? (() => {
        const url = project.thumbnailUrl as string;
        // Insert Cloudinary transformations before the version/public_id segment
        // Pattern: /upload/ -> /upload/w_1920,h_1080,c_fill,f_auto,q_auto/
        return url.replace('/upload/', '/upload/w_1920,h_1080,c_fill,f_auto,q_auto/');
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
      {/* Background image or fallback */}
      {cloudinaryUrl ? (
        <Image
          src={cloudinaryUrl}
          alt={project.title}
          fill
          priority={isActive}
          style={{ objectFit: 'cover' }}
          sizes="100vw"
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, var(--color-bg-primary) 0%, var(--color-bg-primary) 30%, transparent 60%)',
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
        className="absolute flex flex-col gap-4"
        style={{
          left: 48,
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: 520,
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
            fontSize: 40,
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
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              maxWidth: 480,
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