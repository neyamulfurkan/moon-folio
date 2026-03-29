'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ContactForm } from '@/components/ui/ContactForm';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { SparkCharacter } from '@/components/character/SparkCharacter';

const ARC_PATHS = [
  'M 0,0 C 10,-8 20,8 30,-4 C 40,-12 50,6 60,0',
  'M 0,0 C 8,10 22,-6 32,4 C 42,12 52,-8 60,0',
  'M 0,0 C 12,-6 18,10 28,-2 C 38,-10 48,8 60,0',
] as const;

const CHECKMARK_PATH = 'M 8,24 L 20,36 L 44,12';

export const ContactSection: React.FC = () => {
  const isReduced = useReducedMotion();

  const [successState, setSuccessState] = useState(false);
  const [arcIndex, setArcIndex] = useState(0);
  const [arcIntensity, setArcIntensity] = useState<'normal' | 'high' | 'connected'>('normal');
  const [wireProgress, setWireProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [headingGlow, setHeadingGlow] = useState(false);
  const [hairSpike, setHairSpike] = useState(false);
  const [checkmarkLength, setCheckmarkLength] = useState(0);
  const [showSuccessText, setShowSuccessText] = useState(false);

  const arcIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const checkmarkRef = useRef<SVGPathElement | null>(null);
  const hasEnteredRef = useRef(false);

  // Arc flickering interval
  useEffect(() => {
    if (successState) return;

    const intervalMs = arcIntensity === 'high' ? 30 : 60;

    arcIntervalRef.current = setInterval(() => {
      setArcIndex((prev) => (prev + 1) % ARC_PATHS.length);
    }, intervalMs);

    return () => {
      if (arcIntervalRef.current) clearInterval(arcIntervalRef.current);
    };
  }, [successState, arcIntensity]);

  // Section enter — heading glow
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnteredRef.current) {
            hasEnteredRef.current = true;
            setHeadingGlow(true);
            setTimeout(() => setHeadingGlow(false), 600);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleSuccess = useCallback(() => {
    if (isReduced) {
      setSuccessState(true);
      setShowSuccess(true);
      setShowSuccessText(true);
      return;
    }

    // Stop arc flickering
    if (arcIntervalRef.current) clearInterval(arcIntervalRef.current);

    setSuccessState(true);

    // Animate wires toward each other
    setWireProgress(1);

    // At 400ms: increase arc intensity
    const intensityTimer = setTimeout(() => {
      setArcIntensity('high');
    }, 400);

    // At 600ms: arc becomes solid line
    const connectedTimer = setTimeout(() => {
      setArcIntensity('connected');

      // Trigger mini hair spike
      setHairSpike(true);
      setTimeout(() => setHairSpike(false), 300);

      // Show success state
      setShowSuccess(true);

      // Animate checkmark
      const totalLength = checkmarkRef.current?.getTotalLength() ?? 50;
      setCheckmarkLength(totalLength);

      // Show success text after checkmark draws
      setTimeout(() => setShowSuccessText(true), 600);
    }, 600);

    return () => {
      clearTimeout(intensityTimer);
      clearTimeout(connectedTimer);
    };
  }, [isReduced]);

  const arcColor =
    arcIntensity === 'high'
      ? 'var(--color-electric, #ffe535)'
      : arcIntensity === 'connected'
        ? 'var(--color-accent)'
        : 'var(--color-accent)';

  const arcStrokeWidth =
    arcIntensity === 'connected' ? 3 : arcIntensity === 'high' ? 2 : 1.5;

  const arcOpacity = arcIntensity === 'connected' ? 1 : arcIntensity === 'high' ? 0.9 : 0.7;

  const checkmarkTotalLength = 55;

  return (
    <SectionTransition id="contact" label="contact" zIndex={60} bgColor="primary">
      <section
        ref={sectionRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ghost Spark — bottom-left, within section bounds */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            opacity: 0.18,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <SparkCharacter size="ghost" showChat={false} />
        </div>

        {/* Section heading */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '64px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            <span
              style={{
                color: 'var(--color-text-primary)',
                transition: isReduced ? 'none' : 'color 200ms ease',
              }}
            >
              connect
            </span>
            <motion.span
              animate={
                headingGlow
                  ? {
                      textShadow: [
                        '0 0 0px var(--color-accent)',
                        '0 0 12px var(--color-accent)',
                        '0 0 0px var(--color-accent)',
                      ],
                      color: ['var(--color-accent)', 'var(--color-accent)', 'var(--color-accent)'],
                    }
                  : { textShadow: 'none', color: 'var(--color-accent)' }
              }
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                display: 'inline',
              }}
            >
              ()
            </motion.span>
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              marginTop: '12px',
              fontFamily: 'var(--font-display)',
            }}
          >
            Got a project or opportunity? Send a signal.
          </p>
        </div>

        {/* Main content grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
            gap: '80px',
            maxWidth: '960px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            alignItems: 'center',
          }}
        >
          {/* Left column — wire metaphor SVG */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <svg
              viewBox="0 0 200 120"
              width="200"
              height="120"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              overflow="visible"
            >
              {/* Moon's wire — left side */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: successState ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22, duration: 0.6 }}
              >
                {/* Wire body */}
                <line
                  x1="0"
                  y1="60"
                  x2="65"
                  y2="60"
                  stroke="var(--color-copper, #b87333)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Wire insulation stripes */}
                {[10, 20, 30, 40, 50].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="56"
                    x2={x}
                    y2="64"
                    stroke="var(--color-border-default)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
                {/* Exposed tip */}
                <circle cx="65" cy="60" r="3" fill="var(--color-copper, #b87333)" />
                {/* Label */}
                <text
                  x="32"
                  y="52"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  fill="var(--color-text-tertiary)"
                  textAnchor="middle"
                >
                  moon
                </text>
              </motion.g>

              {/* Visitor's wire — right side */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: successState ? -28 : 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22, duration: 0.6 }}
              >
                {/* Wire body */}
                <line
                  x1="200"
                  y1="60"
                  x2="135"
                  y2="60"
                  stroke="var(--color-copper, #b87333)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Wire insulation stripes */}
                {[145, 155, 165, 175, 185].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="56"
                    x2={x}
                    y2="64"
                    stroke="var(--color-border-default)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
                {/* Exposed tip */}
                <circle cx="135" cy="60" r="3" fill="var(--color-copper, #b87333)" />
                {/* Label */}
                <text
                  x="168"
                  y="52"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  fill="var(--color-text-tertiary)"
                  textAnchor="middle"
                >
                  you
                </text>
              </motion.g>

              {/* Arc / connection in the gap */}
              <g transform="translate(70, 60)">
                <AnimatePresence mode="wait">
                  {arcIntensity === 'connected' ? (
                    /* Solid connected line */
                    <motion.line
                      key="solid"
                      x1="0"
                      y1="0"
                      x2="60"
                      y2="0"
                      stroke="var(--color-accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  ) : (
                    /* Flickering arc */
                    <motion.path
                      key={`arc-${arcIndex}`}
                      d={ARC_PATHS[arcIndex] ?? ARC_PATHS[0]}
                      fill="none"
                      stroke={arcColor}
                      strokeWidth={arcStrokeWidth}
                      strokeLinecap="round"
                      opacity={arcOpacity}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: arcOpacity }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.03 }}
                      style={{
                        filter:
                          arcIntensity === 'high'
                            ? 'drop-shadow(0 0 4px var(--color-electric, #ffe535))'
                            : 'drop-shadow(0 0 2px var(--color-accent))',
                      }}
                    />
                  )}
                </AnimatePresence>
              </g>

              {/* Mini hair spike SVG (success animation) */}
              <AnimatePresence>
                {hairSpike && (
                  <motion.g
                    key="hair-spike"
                    transform="translate(92, 0)"
                    initial={{ scaleY: 1, opacity: 1 }}
                    animate={{ scaleY: 1.5, opacity: 1 }}
                    exit={{ scaleY: 1, opacity: 0 }}
                    transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 8 }}
                    style={{ transformOrigin: '8px 20px' }}
                  >
                    <path
                      d="M 8,20 C 4,12 2,4 8,0 C 14,4 12,12 8,20Z"
                      fill="var(--color-text-secondary)"
                      stroke="none"
                      opacity="0.6"
                    />
                    <path
                      d="M 8,20 C 0,10 -6,0 0,-6 C 6,0 4,10 8,20Z"
                      fill="var(--color-text-secondary)"
                      stroke="none"
                      opacity="0.4"
                    />
                    <path
                      d="M 8,20 C 16,10 22,0 16,-6 C 10,0 12,10 8,20Z"
                      fill="var(--color-text-secondary)"
                      stroke="none"
                      opacity="0.4"
                    />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>

            {/* Success state — checkmark + text */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {/* Checkmark SVG */}
                  <svg
                    viewBox="0 0 52 48"
                    width="52"
                    height="48"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <motion.path
                      ref={checkmarkRef}
                      d={CHECKMARK_PATH}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{
                        pathLength: 0,
                        strokeDasharray: checkmarkTotalLength,
                        strokeDashoffset: checkmarkTotalLength,
                      }}
                      animate={{
                        pathLength: 1,
                        strokeDashoffset: 0,
                      }}
                      transition={
                        isReduced
                          ? { duration: 0 }
                          : { duration: 0.5, ease: 'easeOut' }
                      }
                    />
                  </svg>

                  {/* Success text */}
                  <AnimatePresence>
                    {showSuccessText && (
                      <motion.p
                        key="success-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-display)',
                          textAlign: 'center',
                          maxWidth: '240px',
                          lineHeight: 1.5,
                        }}
                      >
                        Signal received.{' '}
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          I&apos;ll respond within 24 hours.
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column — contact form */}
          <AnimatePresence mode="wait">
            {!successState ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <ContactForm onSuccess={handleSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                style={{ minHeight: '320px' }}
              />
            )}
          </AnimatePresence>
        </div>
      </section>
    </SectionTransition>
  );
};