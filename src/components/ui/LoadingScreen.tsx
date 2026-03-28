'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  HairIdle,
  HairShocked,
  FaceNeutral,
  Sunglasses,
  Body,
  LeftArm,
  RightArm,
  Legs,
  Stool,
  DeskSetup,
  PCTower,
  WireAndPulse,
  ThoughtBubbleCharacter,
} from '@/components/character/SparkParts';
import { SparkParticles } from '@/components/character/SparkParticles';

type LoadingPhase = 'wire' | 'assemble' | 'breathe' | 'charge' | 'flash' | 'complete';

type LoadingScreenProps = {
  onComplete: () => void;
};

const SESSION_KEY = 'spark-loading-done';

const partVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const isReduced = useReducedMotion();
  const [phase, setPhase] = useState<LoadingPhase>('wire');
  const [symbol, setSymbol] = useState<string>('{ }');
  const onCompleteRef = useRef(onComplete);
  const symbolIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompleted = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage unavailable — ignore
    }
    onCompleteRef.current();
  }, []);

  // Reduced motion: skip immediately
  useEffect(() => {
    if (!isReduced) return;
    const t = setTimeout(complete, 100);
    return () => clearTimeout(t);
  }, [isReduced, complete]);

  // Check sessionStorage to skip on subsequent navigations
  useEffect(() => {
    if (isReduced) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        complete();
        return;
      }
    } catch {
      // ignore
    }
  }, [isReduced, complete]);

  // Phase timeline
  useEffect(() => {
    if (isReduced) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const t1 = setTimeout(() => setPhase('assemble'), 300);
    timers.push(t1);

    const t2 = setTimeout(() => setPhase('breathe'), 1000);
    timers.push(t2);

    const t3 = setTimeout(() => setPhase('charge'), 2200);
    timers.push(t3);

    const t4 = setTimeout(() => setPhase('flash'), 3400);
    timers.push(t4);

    const t5 = setTimeout(() => {
      setPhase('complete');
      complete();
    }, 3560);
    timers.push(t5);

    return () => timers.forEach(clearTimeout);
  }, [isReduced, complete]);

  // Symbol cycling
  useEffect(() => {
    if (phase !== 'breathe' && phase !== 'charge') return;

    const symbols = ['{ }', '</>', '⚡', '⊕', '~', '01'];
    let index = 0;
    const interval = phase === 'charge' ? 200 : 600;

    symbolIntervalRef.current = setInterval(() => {
      index = (index + 1) % symbols.length;
      setSymbol(symbols[index] ?? '{ }');
    }, interval);

    return () => {
      if (symbolIntervalRef.current !== null) {
        clearInterval(symbolIntervalRef.current);
        symbolIntervalRef.current = null;
      }
    };
  }, [phase]);

  if (isReduced) return null;
  if (phase === 'complete') return null;

  const showCharacter = phase === 'assemble' || phase === 'breathe' || phase === 'charge' || phase === 'flash';
  const showThoughtBubble = phase === 'breathe' || phase === 'charge' || phase === 'flash';
  const showParticles = phase === 'charge' || phase === 'flash';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#07090f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: phase === 'flash' ? 'none' : 'all',
      }}
    >
      {/* Wire draw animation — runs in wire phase */}
      {phase === 'wire' && (
        <svg
          viewBox="0 0 600 100"
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            transform: 'translateY(-50%)',
            width: '80%',
            maxWidth: 600,
            overflow: 'visible',
          }}
          aria-hidden="true"
        >
          <motion.path
            d="M0 50 C100 48 200 52 300 50 C400 48 500 52 600 50"
            fill="none"
            stroke="#b87333"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </svg>
      )}

      {/* Character assembly */}
      <AnimatePresence>
        {showCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'relative' }}
          >
            <svg
              viewBox="0 0 480 520"
              role="img"
              aria-label="Spark assembling"
              style={{
                width: 280,
                height: 'auto',
                overflow: 'visible',
              }}
            >
              <motion.g
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Assembly order: stool → feet (legs) → legs → body → desk → arms → head → sunglasses → hair */}
                <motion.g variants={partVariants}>
                  <Stool />
                </motion.g>

                <motion.g variants={partVariants}>
                  <Legs />
                </motion.g>

                <motion.g variants={partVariants}>
                  <DeskSetup />
                </motion.g>

                <motion.g variants={partVariants}>
                  <Body />
                </motion.g>

                <motion.g variants={partVariants}>
                  <PCTower />
                </motion.g>

                <motion.g variants={partVariants}>
                  <WireAndPulse showPulse={phase === 'charge'} />
                </motion.g>

                <motion.g variants={partVariants}>
                  <LeftArm />
                </motion.g>

                <motion.g variants={partVariants}>
                  <RightArm />
                </motion.g>

                <motion.g variants={partVariants}>
                  <FaceNeutral />
                </motion.g>

                <motion.g variants={partVariants}>
                  <Sunglasses />
                </motion.g>

                <motion.g
                  variants={partVariants}
                  style={{ transformOrigin: '234px 120px' }}
                >
                  <HairIdle />
                  {phase === 'flash' && <HairShocked opacity={0.8} />}
                </motion.g>

                <AnimatePresence>
                  {showThoughtBubble && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ transformOrigin: '130px 92px' }}
                    >
                      <ThoughtBubbleCharacter symbol={symbol} opacity={0.75} />
                    </motion.g>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showParticles && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SparkParticles
                        isActive={showParticles}
                        originX={450}
                        originY={295}
                      />
                    </motion.g>
                  )}
                </AnimatePresence>
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash overlay */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.12, delay: 0.016 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#ffffff',
              zIndex: 10000,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
};