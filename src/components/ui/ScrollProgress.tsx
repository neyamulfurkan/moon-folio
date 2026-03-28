'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { motion, useTransform } from 'framer-motion';

export const ScrollProgress: React.FC = () => {
  const isReduced = useReducedMotion();
  const { progress } = useScrollProgress();

  const width = useTransform(progress, [0, 1], ['0%', '100%']);

  if (isReduced) return null;

  return (
    <motion.div
      style={{
        width,
        background: 'linear-gradient(to right, var(--color-accent), var(--color-amber))',
      }}
      className="fixed top-0 left-0 h-[2px] z-[200] origin-left"
      aria-hidden="true"
    />
  );
};