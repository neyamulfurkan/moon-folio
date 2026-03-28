'use client';

import { motion } from 'framer-motion';
import type { Experience } from '@/types/index';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type ExperienceNodeProps = {
  experience: Experience;
  index: number;
  side: 'left' | 'right';
  isVisible: boolean;
};

const getYear = (date: Date | string): string =>
  new Date(date).getFullYear().toString();

export const ExperienceNode: React.FC<ExperienceNodeProps> = ({
  experience,
  index,
  side,
  isVisible,
}) => {
  const isReduced = useReducedMotion();

  const initialX = isReduced ? 0 : side === 'left' ? -40 : 40;

  const dateRange = experience.isPresent
    ? `${getYear(experience.startDate)}–Present`
    : `${getYear(experience.startDate)}–${experience.endDate ? getYear(experience.endDate) : ''}`;

  return (
    <motion.article
      initial={{ opacity: 0, x: initialX }}
      animate={
        isVisible
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: initialX }
      }
      transition={
        isReduced
          ? { duration: 0.2 }
          : { type: 'spring', stiffness: 200, damping: 25 }
      }
      style={{
        position: 'relative',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      {/* IC reference label */}
      <span
        style={{
          position: 'absolute',
          top: '8px',
          left: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.05em',
          userSelect: 'none',
        }}
      >
        IC-{index.toString().padStart(2, '0')}
      </span>

      {/* Date range */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--color-text-tertiary)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {dateRange}
      </div>

      {/* Role title */}
      <h3
        style={{
          marginTop: '16px',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1.2,
          paddingRight: '120px',
        }}
      >
        {experience.role}
      </h3>

      {/* Organization */}
      <p
        style={{
          marginTop: '4px',
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
        }}
      >
        {experience.organization}
      </p>

      {/* Description bullets */}
      {experience.description.length > 0 && (
        <ul
          style={{
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {experience.description.map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  lineHeight: '1.7',
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