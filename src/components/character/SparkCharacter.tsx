'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HairIdle,
  HairShocked,
  FaceNeutral,
  FaceRelaxed,
  Sunglasses,
  Body,
  LeftArm,
  RightArm,
  Legs,
  Stool,
  DeskSetup,
  LaptopKeyboard,
  PCTower,
  WireAndPulse,
  ThoughtBubbleCharacter,
} from '@/components/character/SparkParts';
import { SparkParticles } from '@/components/character/SparkParticles';
import { SparkChatBubble } from '@/components/character/SparkChatBubble';
import { useSparkAnimation } from '@/components/character/useSparkAnimation';
import { angleToPoint, clamp, isNightTime } from '@/lib/utils';

type SparkCharacterProps = {
  onChatOpen?: () => void;
  onShockReady?: (fn: () => Promise<void>) => void;
  size?: 'hero' | 'footer' | 'ghost';
  showChat?: boolean;
  className?: string;
  scrollProgress?: number;
};

const THOUGHT_SYMBOLS = ['{ }', '</>', '⚡', '⊕', '~', '01'] as const;
const HEAD_CENTER = { x: 234, y: 172 };

export const SparkCharacter: React.FC<SparkCharacterProps> = ({
  onChatOpen,
  onShockReady,
  size = 'hero',
  showChat = true,
  className,
  scrollProgress = 0,
}) => {
  const {
    animationState,
    hairControls,
    bodyControls,
    leftArmControls,
    rightArmControls,
    legsControls,
    headControls,
    thoughtBubbleControls,
    triggerShock,
    triggerStartled,
    triggerRelaxed,
    isReduced,
    showChatIndicator,
    setShowChatIndicator,
  } = useSparkAnimation();

  const [currentSymbol, setCurrentSymbol] = useState<string>(THOUGHT_SYMBOLS[0] ?? '{ }');
  const [shockedHairOpacity, setShockedHairOpacity] = useState<number>(0);
  const [isNight, setIsNight] = useState(false);
  const shockFadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expose triggerShock to parent via callback so HeroSection shares this instance
  useEffect(() => {
    if (onShockReady) {
      onShockReady(triggerShock);
    }
  }, [onShockReady, triggerShock]);
  const symbolIndexRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Detect night time for Zzz mode (footer only)
  useEffect(() => {
    setIsNight(isNightTime());
    const interval = setInterval(() => {
      setIsNight(isNightTime());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Relaxed state for footer
  useEffect(() => {
    if (size === 'footer') {
      triggerRelaxed();
    }
  }, [size, triggerRelaxed]);

  // Thought bubble symbol cycling
  useEffect(() => {
    const intervalMs = animationState === 'idle' || animationState === 'relaxed' ? 3000 : 1000;

    const interval = setInterval(() => {
      symbolIndexRef.current = (symbolIndexRef.current + 1) % THOUGHT_SYMBOLS.length;
      const next = THOUGHT_SYMBOLS[symbolIndexRef.current];
      if (next !== undefined) {
        setCurrentSymbol(next);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [animationState]);

  // Sync shocked hair — snap in instantly, hold, then fade out after settle
  useEffect(() => {
    if (shockFadeOutTimerRef.current) {
      clearTimeout(shockFadeOutTimerRef.current);
      shockFadeOutTimerRef.current = null;
    }

    if (animationState === 'shocked') {
      // Snap to fully visible immediately
      setShockedHairOpacity(1);
    } else if (animationState === 'idle') {
      // Delay fade-out so hair is still visible during spring settle
      shockFadeOutTimerRef.current = setTimeout(() => {
        setShockedHairOpacity(0);
      }, 600);
    }
  }, [animationState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shockFadeOutTimerRef.current) clearTimeout(shockFadeOutTimerRef.current);
    };
  }, []);

  // Cursor tracking (footer only)
  useEffect(() => {
    if (size !== 'footer' || isReduced) return;

    const handleMouseMove = (e: MouseEvent): void => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 480 / rect.width;
      const scaleY = 520 / rect.height;

      const cursorInSvg = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      const angle = angleToPoint(HEAD_CENTER, cursorInSvg);
      const clampedAngle = clamp(angle, -30, 30);

      void headControls.start({
        rotate: clampedAngle,
        transition: { type: 'spring', stiffness: 120, damping: 18 },
      });
    };

    const handleMouseLeave = (): void => {
      void headControls.start({
        rotate: 0,
        transition: { type: 'spring', stiffness: 120, damping: 18 },
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    svgRef.current?.closest('[data-footer]')?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [size, isReduced, headControls]);

  const handleCharacterClick = useCallback((): void => {
    if (!onChatOpen) return;
    void triggerStartled();
    if (showChat) {
      onChatOpen();
      setShowChatIndicator(false);
    }
  }, [onChatOpen, triggerStartled, showChat, setShowChatIndicator]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.key === ' ') e.preventDefault();
        handleCharacterClick();
      }
    },
    [handleCharacterClick]
  );

  const isGhost = size === 'ghost';
  const isFooter = size === 'footer';
  const hasInteraction = Boolean(onChatOpen) && showChat;

  const svgStyle: React.CSSProperties = isGhost
    ? { width: '200px', height: '217px', opacity: 0.3 }
    : isFooter
    ? { maxWidth: '100%', width: '380px' }
    : { width: '380px', height: '412px', display: 'block' };

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      data-footer={isFooter ? '' : undefined}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 480 520"
        role="img"
        aria-label="Spark — Moon's portfolio character, a young South Asian man sitting at his desk"
        xmlns="http://www.w3.org/2000/svg"
        style={svgStyle}
        overflow="hidden"
      >
        {/* Wire and pulse — lowest z */}
        <WireAndPulse showPulse={!isGhost} />

        {/* Stool — behind desk */}
        <Stool />

        {/* Legs — hang below stool, behind desk */}
        <motion.g animate={legsControls} style={{ transformOrigin: '240px 362px' }}>
          <Legs />
        </motion.g>

        {/* Body — sits behind desk */}
        <motion.g animate={bodyControls}>
          <Body />
        </motion.g>

        {/* Left arm — behind desk */}
        <motion.g animate={leftArmControls}>
          <LeftArm />
        </motion.g>

        <motion.g animate={rightArmControls}>
          <RightArm />
        </motion.g>

        {/* Head group — face + sunglasses + hair */}
        <motion.g
          animate={headControls}
          style={{ transformOrigin: `${HEAD_CENTER.x}px ${HEAD_CENTER.y}px` }}
        >
          {isFooter ? <FaceRelaxed /> : <FaceNeutral />}
          <Sunglasses />

          {/* Hair idle — hidden while shocked, visible otherwise */}
          <motion.g
            animate={hairControls}
            style={{
              transformOrigin: `${HEAD_CENTER.x}px ${HEAD_CENTER.y}px`,
              opacity: shockedHairOpacity > 0.1 ? 0 : 1,
              transition: 'opacity 80ms ease-in',
            }}
          >
            <HairIdle opacity={1} />
          </motion.g>

          {/* Hair shocked — CSS transition for smooth fade in/out */}
          <g
            style={{
              opacity: shockedHairOpacity,
              transition: shockedHairOpacity === 1
                ? 'opacity 60ms ease-in'
                : 'opacity 800ms ease-out',
            }}
          >
            <HairShocked opacity={1} />
          </g>
        </motion.g>

        {/* Desk + laptop lid rendered AFTER head so screen is on top */}
        <DeskSetup scrollProgress={scrollProgress} />

        {/* PC Tower — on top of desk */}
        <PCTower />

        {/* Laptop keyboard — in front of everything */}
        <LaptopKeyboard />

        {/* Thought bubble */}
        <motion.g animate={thoughtBubbleControls}>
          <ThoughtBubbleCharacter symbol={currentSymbol} opacity={isGhost ? 0.4 : 0.6} />
        </motion.g>

        {/* Particles at wire tip */}
        <SparkParticles isActive={!isGhost} originX={450} originY={295} />

        {/* Zzz mode — footer + night time */}
        {isFooter && isNight && !isReduced && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.text
                key={`zzz-${i}`}
                x={210 + i * 14}
                y={120 - i * 18}
                fontFamily="var(--font-mono)"
                fontSize={10 + i * 3}
                fill="var(--color-text-tertiary)"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  y: [-10, -30 - i * 8],
                }}
                transition={{
                  duration: 2.4,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              >
                z
              </motion.text>
            ))}
          </>
        )}

        {/* Invisible hitbox for click interaction */}
        {hasInteraction && (
          <rect
            x="80"
            y="60"
            width="360"
            height="460"
            fill="transparent"
            onClick={handleCharacterClick}
            onKeyDown={handleKeyDown}
            style={{ cursor: 'pointer' }}
            aria-label="Click to chat with Spark"
            role="button"
            tabIndex={0}
          />
        )}
      </svg>

      {/* Chat bubble indicator — outside SVG, positioned absolutely */}
      {size === 'hero' && showChat && (
        <SparkChatBubble
          visible={showChatIndicator}
          onMobile={false}
        />
      )}
    </div>
  );
};