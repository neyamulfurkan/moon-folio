'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type ElectricButtonProps = {
  variant: 'primary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  download?: boolean | string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
};

export const ElectricButton: React.FC<ElectricButtonProps> = ({
  variant,
  children,
  onClick,
  href,
  download,
  disabled = false,
  className,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const isReduced = useReducedMotion();
  const rootRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rectRef = useRef<SVGRectElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const [perimeter, setPerimeter] = useState(0);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDims({ width, height });
      setPerimeter(2 * (width + height));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rect = rectRef.current;
    if (!rect || perimeter === 0) return;
    rect.style.strokeDasharray = `${perimeter}`;
    rect.style.strokeDashoffset = `${perimeter}`;
  }, [perimeter]);

  const handleMouseEnter = useCallback(() => {
    if (isReduced || !rectRef.current || perimeter === 0) return;

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const currentOffset = parseFloat(
      rectRef.current.style.strokeDashoffset || `${perimeter}`
    );

    animationRef.current = rectRef.current.animate(
      [
        { strokeDashoffset: currentOffset },
        { strokeDashoffset: 0 },
      ],
      {
        duration: 600,
        easing: 'linear',
        fill: 'forwards',
      }
    );
  }, [isReduced, perimeter]);

  const handleMouseLeave = useCallback(() => {
    if (isReduced || !rectRef.current || perimeter === 0) return;

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const currentOffset = parseFloat(
      getComputedStyle(rectRef.current).strokeDashoffset || '0'
    );

    animationRef.current = rectRef.current.animate(
      [
        { strokeDashoffset: currentOffset },
        { strokeDashoffset: perimeter },
      ],
      {
        duration: 600,
        easing: 'linear',
        fill: 'forwards',
      }
    );

    animationRef.current.onfinish = () => {
      if (rectRef.current) {
        rectRef.current.style.strokeDashoffset = `${perimeter}`;
      }
    };
  }, [isReduced, perimeter]);

  const strokeColor =
    variant === 'primary'
      ? 'rgba(0, 212, 255, 0.8)'
      : 'var(--color-accent)';

  const baseClasses = cn(
    'relative inline-flex items-center justify-center',
    'font-display text-sm font-medium',
    'transition-opacity duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'select-none',
    variant === 'primary' && [
      'bg-[var(--color-accent)] text-[var(--color-bg-primary)]',
      'px-8 py-4 rounded-[8px]',
      !isReduced && 'hover:opacity-90',
    ],
    variant === 'ghost' && [
      'bg-transparent text-[var(--color-text-primary)]',
      'border border-[var(--color-border-strong)]',
      'px-8 py-4 rounded-[8px]',
      !isReduced && 'hover:opacity-80',
    ],
    disabled && 'opacity-40 pointer-events-none cursor-not-allowed',
    className
  );

  const svgOverlay = !isReduced && perimeter > 0 ? (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        borderRadius: '8px',
      }}
    >
      <rect
        ref={rectRef}
        x="1"
        y="1"
        width={dims.width > 2 ? dims.width - 2 : 0}
        height={dims.height > 2 ? dims.height - 2 : 0}
        rx="7"
        ry="7"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter}
        strokeLinecap="round"
      />
    </svg>
  ) : null;

  const sharedProps = {
    'data-cursor': 'pointer' as const,
    'aria-label': ariaLabel,
    'aria-disabled': disabled || undefined,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: baseClasses,
  };

  if (href) {
    return (
      <a
        ref={rootRef as React.RefObject<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        download={download}
        {...sharedProps}
      >
        {svgOverlay}
        {children}
      </a>
    );
  }

  return (
    <button
      ref={rootRef as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...sharedProps}
    >
      {svgOverlay}
      {children}
    </button>
  );
};