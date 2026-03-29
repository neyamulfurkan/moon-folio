'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparkCharacter } from '@/components/character/SparkCharacter';
import { SparkChat } from '@/components/character/SparkChat';
import { useSparkChat } from '@/components/character/useSparkChat';
import { useSparkAnimation } from '@/components/character/useSparkAnimation';
import { ElectricButton } from '@/components/ui/ElectricButton';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HERO_SCENES_DEFAULT, HERO_SCENE_INTERVAL_MS } from '@/lib/constants';
import type { HeroScene } from '@/types/index';

type HeroSectionProps = {
  scenes: HeroScene[];
  cvUrl: string;
};

const CHAR_REVEAL_SPEED_MS = 15;

const useTypewriterReveal = (
  text: string,
  isReduced: boolean
): { visibleCount: number; isComplete: boolean } => {
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isReduced) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);

    intervalRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, CHAR_REVEAL_SPEED_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, isReduced]);

  return { visibleCount, isComplete: visibleCount >= text.length };
};

export const HeroSection: React.FC<HeroSectionProps> = ({ scenes, cvUrl }) => {
  const isReduced = useReducedMotion();
  const { isScrolled } = useScrollProgress();
  const heroRef = useRef<HTMLElement>(null);

  const effectiveScenes: readonly HeroScene[] =
    scenes.length > 0 ? scenes : HERO_SCENES_DEFAULT;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [flashVisible, setFlashVisible] = useState(false);
  const [eyebrowVisible, setEyebrowVisible] = useState(false);
  const [supportingVisible, setSupportingVisible] = useState(false);

  const currentScene =
    effectiveScenes[currentSceneIndex] ??
    effectiveScenes[0] ??
    HERO_SCENES_DEFAULT[0];

  // triggerShock is passed down to SparkCharacter via ref so both share one animation instance
  const sparkShockRef = useRef<(() => Promise<void>) | null>(null);
  const { triggerStartled } = useSparkAnimation();

  const triggerShock = useCallback(async (): Promise<void> => {
    if (sparkShockRef.current) {
      await sparkShockRef.current();
    }
  }, []);

  const {
    messages,
    isOpen,
    isLoading,
    inputValue,
    openChat,
    closeChat,
    sendMessage,
    setInputValue,
    messagesEndRef,
    error,
  } = useSparkChat({ onOpen: triggerStartled });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (!currentScene) return;
    heroRef.current?.style.setProperty('--hero-accent', currentScene.accentColor);
  }, [currentScene]);

  const headline = currentScene?.headline ?? '';
  const { visibleCount, isComplete: headlineComplete } = useTypewriterReveal(headline, isReduced);

  useEffect(() => {
    setEyebrowVisible(false);
    setSupportingVisible(false);
    const t = setTimeout(() => setEyebrowVisible(true), 100);
    return () => clearTimeout(t);
  }, [currentSceneIndex]);

  useEffect(() => {
    if (!headlineComplete) return;
    const t = setTimeout(() => setSupportingVisible(true), 200);
    return () => clearTimeout(t);
  }, [headlineComplete]);

  const advanceScene = useCallback(async (): Promise<void> => {
    if (isOpenRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    setFlashVisible(true);
    void triggerShock();
    setTimeout(() => setFlashVisible(false), 200);
    setCurrentSceneIndex((prev) => (prev + 1) % effectiveScenes.length);
  }, [effectiveScenes.length, triggerShock]);

  useEffect(() => {
    intervalRef.current = setInterval(() => void advanceScene(), HERO_SCENE_INTERVAL_MS);

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        intervalRef.current = setInterval(() => void advanceScene(), HERO_SCENE_INTERVAL_MS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [advanceScene]);

  const handleViewWork = useCallback((): void => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const visibleHeadline = isReduced ? headline : headline.slice(0, visibleCount);

  return (
    <section
      ref={heroRef}
      id="hero"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: '100vh',
        overflow: 'clip',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'normal',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* Electric flash — character area only, no white page flash */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            key="lightning"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, times: [0, 0.08, 0.16, 0.24, 0.6, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '45%',
              height: '100%',
              zIndex: 49,
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(255,229,53,0.18) 0%, rgba(0,212,255,0.08) 55%, transparent 80%)',
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Desktop layout ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          height: '100%',
          padding: '0 48px',
          gap: '32px',
          alignItems: 'center',
        }}
        className="max-md:hidden"
      >
        {/* Text column — absolute inner layout so buttons never move */}
        <div
          style={{
            gridColumn: '1 / 2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {/* Fixed-height eyebrow */}
          <div style={{ height: '20px', marginBottom: '20px' }}>
            <motion.p
              animate={{ opacity: eyebrowVisible ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--hero-accent, var(--color-accent))',
                margin: 0,
                lineHeight: '20px',
              }}
            >
              {currentScene?.eyebrow}
            </motion.p>
          </div>

          {/* Fixed-height headline box — 3 lines max reserved */}
          <div
            style={{
              height: 'calc(clamp(36px, 5vw, 64px) * 1.1 * 3)',
              marginBottom: '20px',
              overflow: 'hidden',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 600,
                lineHeight: 1.1,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
              aria-label={headline}
            >
              <span aria-hidden="true">{visibleHeadline}</span>
              {!headlineComplete && !isReduced && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1em',
                    backgroundColor: 'var(--color-accent)',
                    marginLeft: '2px',
                    verticalAlign: 'middle',
                    animation: 'pulse 1s step-end infinite',
                  }}
                />
              )}
            </h1>
          </div>

          {/* Fixed-height supporting text — 3 lines reserved */}
          <div
            style={{
              height: 'calc(16px * 1.6 * 3)',
              marginBottom: '32px',
              overflow: 'hidden',
            }}
          >
            <motion.p
              animate={{ opacity: supportingVisible ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                maxWidth: '520px',
                margin: 0,
              }}
            >
              {currentScene?.supporting}
            </motion.p>
          </div>

          {/* CTA Buttons — always at fixed position */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
            <ElectricButton variant="primary" onClick={handleViewWork}>
              View Work
            </ElectricButton>
            {cvUrl ? (
              <ElectricButton variant="ghost" href={cvUrl} download aria-label="Download CV">
                Download CV
              </ElectricButton>
            ) : (
              <ElectricButton variant="ghost" href="#contact">
                Get in Touch
              </ElectricButton>
            )}
          </div>
        </div>

        {/* Spark column — character rendered as fixed overlay (FloatingSparkIsland), this reserves space */}
        <div
          style={{
            gridColumn: '2 / 3',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', width: '380px', height: '412px', flexShrink: 0, zIndex: 1 }}>
            {/* Invisible hitbox so chat still opens from hero */}
            <SparkCharacter onChatOpen={openChat} size="hero" showChat={true} onShockReady={(fn) => { sparkShockRef.current = fn; }} className="opacity-0 pointer-events-auto" />
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '80px 24px 32px',
          overflow: 'hidden',
        }}
        className="hidden max-md:flex"
      >
        {/* Spark — fixed height on mobile */}
        <div
          style={{
            flexShrink: 0,
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ width: '320px', height: '300px', position: 'relative' }}>
            <SparkCharacter onChatOpen={openChat} size="hero" showChat={true} onShockReady={(fn) => { sparkShockRef.current = fn; }} />
          </div>
        </div>

        {/* Eyebrow */}
        <div style={{ height: '20px', marginBottom: '16px', flexShrink: 0 }}>
          <motion.p
            animate={{ opacity: eyebrowVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--hero-accent, var(--color-accent))',
              margin: 0,
            }}
          >
            {currentScene?.eyebrow}
          </motion.p>
        </div>

        {/* Headline — fixed height */}
        <div style={{ height: '120px', marginBottom: '16px', overflow: 'hidden', flexShrink: 0 }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: 600,
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
            aria-label={headline}
          >
            <span aria-hidden="true">{visibleHeadline}</span>
            {!headlineComplete && !isReduced && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  backgroundColor: 'var(--color-accent)',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'pulse 1s step-end infinite',
                }}
              />
            )}
          </h1>
        </div>

        {/* Supporting — fixed height */}
        <div style={{ height: '80px', marginBottom: '24px', overflow: 'hidden', flexShrink: 0 }}>
          <motion.p
            animate={{ opacity: supportingVisible ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {currentScene?.supporting}
          </motion.p>
        </div>

        {/* Buttons — always visible, never pushed */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <ElectricButton variant="primary" onClick={handleViewWork}>
            View Work
          </ElectricButton>
          {cvUrl ? (
            <ElectricButton variant="ghost" href={cvUrl} download aria-label="Download CV">
              Download CV
            </ElectricButton>
          ) : (
            <ElectricButton variant="ghost" href="#contact">
              Get in Touch
            </ElectricButton>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            key="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={isReduced ? { opacity: 1 } : { opacity: 1, y: [0, 6, 0] }}
            exit={{ opacity: 0 }}
            transition={
              isReduced
                ? { duration: 0.3 }
                : {
                    y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                    opacity: { duration: 0.3 },
                  }
            }
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel — rendered outside section so it's not clipped by overflow:hidden */}
      <SparkChat
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        inputValue={inputValue}
        onClose={closeChat}
        onSend={sendMessage}
        onInputChange={setInputValue}
        messagesEndRef={messagesEndRef}
        error={error}
      />
    </section>
  );
};