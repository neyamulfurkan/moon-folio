'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Particle = {
  id: string;
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
};

const generateParticle = (originX: number, originY: number): Particle => ({
  id: `particle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  x: originX + (Math.random() * 8 - 4),
  y: originY + (Math.random() * 6 - 3),
  radius: 3 + Math.random() * 2,
  driftX: Math.random() * 8 - 4,
  driftY: -(12 + Math.random() * 8),
});

type SparkParticlesProps = {
  isActive?: boolean;
  originX?: number;
  originY?: number;
};

export const SparkParticles: React.FC<SparkParticlesProps> = ({
  isActive = true,
  originX = 450,
  originY = 295,
}) => {
  const isReduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const spawnParticle = useCallback(() => {
    if (!isMountedRef.current) return;
    setParticles((prev) => {
      const next = [...prev, generateParticle(originX, originY)];
      return next.slice(-6);
    });
  }, [originX, originY]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isActive || isReduced) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(spawnParticle, 100);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isReduced, spawnParticle]);

  const handleAnimationComplete = useCallback((id: string) => {
    if (!isMountedRef.current) return;
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  if (isReduced) return null;

  return (
    <g>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.radius}
            fill="var(--color-accent)"
            initial={{ opacity: 1, cx: particle.x, cy: particle.y }}
            animate={{
              opacity: 0,
              cx: particle.x + particle.driftX,
              cy: particle.y + particle.driftY,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={() => handleAnimationComplete(particle.id)}
          />
        ))}
      </AnimatePresence>
    </g>
  );
};