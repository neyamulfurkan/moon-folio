'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnimationControls } from 'framer-motion';
import type { AnimationControls } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { AnimationState } from '@/types/index';
import {
  SPARK_CHAT_INDICATOR_DELAY_MS,
  SPARK_CHAT_INDICATOR_TIMEOUT_MS,
} from '@/lib/constants';

export type UseSparkAnimationReturn = {
  animationState: AnimationState;
  setAnimationState: (state: AnimationState) => void;
  hairControls: AnimationControls;
  bodyControls: AnimationControls;
  leftArmControls: AnimationControls;
  rightArmControls: AnimationControls;
  legsControls: AnimationControls;
  headControls: AnimationControls;
  thoughtBubbleControls: AnimationControls;
  triggerShock: () => Promise<void>;
  triggerStartled: () => Promise<void>;
  triggerIdle: () => void;
  triggerRelaxed: () => void;
  isReduced: boolean;
  showChatIndicator: boolean;
  setShowChatIndicator: (v: boolean) => void;
};

type IdleAnimation = 'legSwing' | 'headTurn' | 'wireInspect' | 'yawn';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const IDLE_ANIMATIONS: IdleAnimation[] = ['legSwing', 'headTurn', 'wireInspect', 'yawn'];
const IDLE_CYCLE_MS = 8000;

export const useSparkAnimation = (): UseSparkAnimationReturn => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [showChatIndicator, setShowChatIndicator] = useState(false);

  const isReduced = useReducedMotion();

  const hairControls = useAnimationControls();
  const bodyControls = useAnimationControls();
  const leftArmControls = useAnimationControls();
  const rightArmControls = useAnimationControls();
  const legsControls = useAnimationControls();
  const headControls = useAnimationControls();
  const thoughtBubbleControls = useAnimationControls();

  // Track whether indicator has been shown before — never show again once hidden
  const indicatorShownRef = useRef(false);
  const indicatorHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous idle animation to avoid repeating
  const lastIdleAnimationRef = useRef<IdleAnimation | null>(null);

  // Chat indicator: show after delay, hide after timeout, never repeat
  useEffect(() => {
    const showTimer = setTimeout(() => {
      if (!indicatorShownRef.current) {
        setShowChatIndicator(true);
        indicatorShownRef.current = true;

        indicatorHideTimerRef.current = setTimeout(() => {
          setShowChatIndicator(false);
        }, SPARK_CHAT_INDICATOR_TIMEOUT_MS);
      }
    }, SPARK_CHAT_INDICATOR_DELAY_MS);

    return () => {
      clearTimeout(showTimer);
      if (indicatorHideTimerRef.current) {
        clearTimeout(indicatorHideTimerRef.current);
      }
    };
  }, []);

  const playIdleAnimation = useCallback(
    async (animation: IdleAnimation): Promise<void> => {
      if (isReduced) return;

      switch (animation) {
        case 'legSwing':
          await legsControls.start({
            rotate: [0, 4, -4, 2, 0],
            transition: { duration: 1.2, ease: 'easeInOut' },
          });
          break;

        case 'headTurn':
          await headControls.start({
            rotate: [0, -8, 8, -4, 0],
            transition: { duration: 1.0, ease: 'easeInOut' },
          });
          break;

        case 'wireInspect':
          await rightArmControls.start({
            y: [0, -6, -6, 0],
            transition: { duration: 1.4, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] },
          });
          break;

        case 'yawn':
          await headControls.start({
            rotate: [0, 5, 8, 5, 0],
            y: [0, -2, -4, -2, 0],
            transition: { duration: 1.8, ease: 'easeInOut' },
          });
          break;
      }
    },
    [isReduced, legsControls, headControls, rightArmControls]
  );

  // Idle micro-animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationState !== 'idle' && animationState !== 'relaxed') return;

      const available = IDLE_ANIMATIONS.filter(
        (a) => a !== lastIdleAnimationRef.current
      );
      const pick = available[Math.floor(Math.random() * available.length)];
      if (pick === undefined) return;

      lastIdleAnimationRef.current = pick;
      void playIdleAnimation(pick);
    }, IDLE_CYCLE_MS);

    return () => clearInterval(interval);
  }, [animationState, playIdleAnimation]);

  const triggerShock = useCallback(async (): Promise<void> => {
    if (isReduced) return;

    // Set shocked FIRST — SparkCharacter watches this to show HairShocked
    setAnimationState('shocked');

    // Head snaps back then settles
    void headControls.start({
      rotate: [-6, 12, -8, 4, -2, 0],
      x: [0, -3, 5, -2, 1, 0],
      transition: { duration: 0.5, ease: 'easeOut' },
    });

    // Body jolts upward slightly
    void bodyControls.start({
      y: [0, -6, 3, -2, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    });

    // Hair scale — animates the HairIdle group up while HairShocked is visible
    void hairControls.start({
      scaleY: [1, 1.9, 1.7],
      scaleX: [1, 1.35, 1.25],
      transition: { duration: 0.1, ease: 'easeOut' },
    });

    // Arms fling outward
    void leftArmControls.start({
      x: [0, -10, -4, 0],
      rotate: [0, -12, -5, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    });
    void rightArmControls.start({
      x: [0, 10, 4, 0],
      rotate: [0, 12, 5, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    });

    // Hold shocked state visibly for 700ms so user can see the hair
    await delay(700);

    // Hair settles back with bounce
    await hairControls.start({
      scaleY: 1,
      scaleX: 1,
      transition: { type: 'spring', stiffness: 80, damping: 6, mass: 1.4 },
    });

    // Back to idle — this triggers HairShocked fade out in SparkCharacter
    setAnimationState('idle');
  }, [isReduced, headControls, hairControls, bodyControls, leftArmControls, rightArmControls]);

  const triggerStartled = useCallback(async (): Promise<void> => {
    if (isReduced) return;

    setAnimationState('startled');

    void headControls.start({
      rotate: 5,
      x: 8,
      transition: { duration: 0.15 },
    });

    await delay(150);

    await headControls.start({
      rotate: 0,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    });

    setAnimationState('idle');
  }, [isReduced, headControls]);

  const triggerIdle = useCallback((): void => {
    setAnimationState('idle');
  }, []);

  const triggerRelaxed = useCallback((): void => {
    setAnimationState('relaxed');
  }, []);

  return {
    animationState,
    setAnimationState,
    hairControls,
    bodyControls,
    leftArmControls,
    rightArmControls,
    legsControls,
    headControls,
    thoughtBubbleControls,
    triggerShock,
    triggerStartled,
    triggerIdle,
    triggerRelaxed,
    isReduced,
    showChatIndicator,
    setShowChatIndicator,
  };
};