'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

type ThoughtBubbleProps = {
  symbol: string;
  opacity?: number;
  size?: 'normal' | 'small';
};

export const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({
  symbol,
  opacity = 0.6,
  size = 'normal',
}) => {
  const isReduced = useReducedMotion();

  const displaySymbol = symbol.length > 4 ? symbol.slice(0, 4) + '…' : symbol;

  const baseWidth = 100;
  const baseHeight = 70;
  const rx = 8;
  const tickLen = 5;
  const scale = size === 'small' ? 0.6 : 1;
  const w = baseWidth;
  const h = baseHeight;

  const pulseAnimation = isReduced
    ? { opacity }
    : {
        opacity: [opacity, opacity * 0.5, opacity],
      };

  const pulseTransition = isReduced
    ? {}
    : {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      };

  return (
    <motion.div
      animate={pulseAnimation}
      transition={pulseTransition}
      style={{
        width: baseWidth * scale,
        height: baseHeight * scale,
        display: 'inline-block',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={baseWidth * scale}
        height={baseHeight * scale}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        aria-hidden="true"
      >
        {/* PCB pad tick marks at each corner — 5px lines extending outward at 90 degrees */}
        {/* Top-left corner: up and left */}
        <line
          x1={rx}
          y1={0}
          x2={rx}
          y2={-tickLen}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={rx}
          x2={-tickLen}
          y2={rx}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Top-right corner: up and right */}
        <line
          x1={w - rx}
          y1={0}
          x2={w - rx}
          y2={-tickLen}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <line
          x1={w}
          y1={rx}
          x2={w + tickLen}
          y2={rx}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Bottom-left corner: down and left */}
        <line
          x1={rx}
          y1={h}
          x2={rx}
          y2={h + tickLen}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={h - rx}
          x2={-tickLen}
          y2={h - rx}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Bottom-right corner: down and right */}
        <line
          x1={w - rx}
          y1={h}
          x2={w - rx}
          y2={h + tickLen}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <line
          x1={w}
          y1={h - rx}
          x2={w + tickLen}
          y2={h - rx}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* Dashed PCB-trace-style rounded rectangle border */}
        <rect
          x={0.5}
          y={0.5}
          width={w - 1}
          height={h - 1}
          rx={rx}
          ry={rx}
          fill="transparent"
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* Symbol text — centered */}
        <text
          x={w / 2}
          y={h / 2}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={14}
          fontFamily="var(--font-mono)"
          fill="var(--color-text-secondary)"
        >
          {displaySymbol}
        </text>
      </svg>
    </motion.div>
  );
};