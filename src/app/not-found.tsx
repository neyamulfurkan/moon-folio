'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
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
  HairIdle,
} from '@/components/character/SparkParts';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// QuestionMark replaces the thought bubble on the 404 page
const QuestionMark: React.FC = () => (
  <g>
    <text
      x="118"
      y="100"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="var(--font-mono)"
      fontSize="42"
      fontWeight="600"
      fill="var(--color-accent)"
      opacity="0.7"
    >
      ?
    </text>
    {/* PCB-corner ticks around the ? */}
    <path d="M92 68 L86 68" fill="none" stroke="var(--color-accent)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    <path d="M98 62 L98 56" fill="none" stroke="var(--color-accent)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    <path d="M144 68 L150 68" fill="none" stroke="var(--color-accent)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    <path d="M138 62 L138 56" fill="none" stroke="var(--color-accent)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    {/* Small dashed box */}
    <rect
      x="92"
      y="62"
      width="52"
      height="52"
      rx="4"
      fill="transparent"
      stroke="var(--color-accent)"
      strokeWidth="0.7"
      strokeDasharray="3 3"
      opacity="0.35"
    />
    {/* Connecting tail to head */}
    <path
      d="M118 114 C122 122 130 130 142 136"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeDasharray="3 2"
      opacity="0.4"
    />
  </g>
);

// Confused Spark: head tilted, left arm raised palm-up, wire no pulse
const ConfusedSpark: React.FC = () => (
  <svg
    viewBox="0 0 480 520"
    role="img"
    aria-label="Spark — confused, looking for the missing page"
    className="w-full h-full"
    style={{ maxWidth: '320px' }}
  >
    {/* Wire — no pulse (signal lost) */}
    <WireAndPulse showPulse={false} />
    {/* Desk and PC */}
    <DeskSetup />
    <PCTower />
    {/* Stool */}
    <Stool />
    {/* Legs */}
    <Legs swingAngle={0} />
    {/* Body */}
    <Body />
    {/* Right arm resting */}
    <RightArm y={0} />
    {/* Left arm raised palm-up — rotation makes the wrist/hand angle upward */}
    <LeftArm rotation={-70} />
    {/* Head — tilted slightly via group rotation */}
    <g transform="rotate(10, 234, 172)">
      <FaceNeutral />
      <Sunglasses />
      <HairIdle />
    </g>
    {/* Question mark above head */}
    <QuestionMark />
    {/* Signal lost indicator near wire */}
    <text
      x="450"
      y="285"
      fontFamily="var(--font-mono)"
      fontSize="9"
      fill="var(--color-danger, #ff4d4d)"
      opacity="0.6"
    >
      NO SIGNAL
    </text>
    <path
      d="M430 289 L470 289"
      fill="none"
      stroke="var(--color-danger, #ff4d4d)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeDasharray="4 3"
      opacity="0.4"
    />
  </svg>
);

export default function NotFound(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const isReduced = useReducedMotion();

  // Safely decode and sanitize path for display
  const rawPath = pathname ?? '/unknown';
  const decodedPath = (() => {
    try {
      return decodeURIComponent(rawPath);
    } catch {
      return rawPath;
    }
  })();
  // Strip any characters that could cause display issues
  const safePath = decodedPath.replace(/[<>"'`]/g, '');

  // Typewriter state for the last terminal line
  const TYPEWRITER_TEXT = '→ Returning you home...';
  const [visibleChars, setVisibleChars] = useState(0);
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Countdown state
  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);

  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter effect — starts immediately
  useEffect(() => {
    if (isReduced) {
      setVisibleChars(TYPEWRITER_TEXT.length);
      setTypewriterDone(true);
      return;
    }

    const charsPerMs = TYPEWRITER_TEXT.length / 1200; // 1.2s total
    const intervalMs = Math.round(1 / charsPerMs);

    typewriterRef.current = setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + 1;
        if (next >= TYPEWRITER_TEXT.length) {
          if (typewriterRef.current !== null) {
            clearInterval(typewriterRef.current);
            typewriterRef.current = null;
          }
          setTypewriterDone(true);
          return TYPEWRITER_TEXT.length;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (typewriterRef.current !== null) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [isReduced]);

  // Countdown — starts after 5 seconds, ticks every second
  useEffect(() => {
    if (cancelled) return;

    redirectRef.current = setTimeout(() => {
      // Start ticking
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            if (countdownRef.current !== null) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    }, 0); // countdown state already starts at 5; we drive the redirect separately

    // Actual redirect after 5s
    const redirectTimer = setTimeout(() => {
      if (!cancelled) {
        router.push('/');
      }
    }, 5000);

    // Tick countdown from 5 down to 0 across that same 5s
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current !== null) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
      }
    };
  }, [cancelled, router]);

  const handleCancel = (): void => {
    setCancelled(true);
    if (redirectRef.current !== null) {
      clearTimeout(redirectRef.current);
      redirectRef.current = null;
    }
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-primary)', padding: '48px 24px' }}
    >
      {/* Layout: character + terminal side by side on desktop, stacked on mobile */}
      <div
        className="flex flex-col md:flex-row items-center justify-center gap-12 w-full"
        style={{ maxWidth: '900px' }}
      >
        {/* Confused Spark */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: '280px', height: '300px' }}
        >
          <ConfusedSpark />
        </div>

        {/* Terminal + info */}
        <div className="flex flex-col gap-8 flex-1" style={{ minWidth: 0 }}>
          {/* Terminal window */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              padding: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '2',
            }}
          >
            {/* Terminal chrome dots */}
            <div className="flex gap-2 mb-4">
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#28c840' }} />
            </div>

            {/* Line 1 */}
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-accent)' }}>$</span>
              {' '}GET{' '}
              <span style={{ color: 'var(--color-text-primary)' }}>{safePath}</span>
            </div>

            {/* Line 2 */}
            <div style={{ color: 'var(--color-danger, #ff4d4d)' }}>
              → Error 404: This page doesn&apos;t exist.
            </div>

            {/* Line 3 */}
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              <span style={{ color: 'var(--color-accent)' }}>$</span>
              {' '}cd /
            </div>

            {/* Line 4 — typewriter reveal */}
            <div style={{ color: 'var(--color-text-secondary)', minHeight: '24px' }}>
              {TYPEWRITER_TEXT.slice(0, visibleChars)}
              {!typewriterDone && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    backgroundColor: 'var(--color-text-secondary)',
                    marginLeft: '1px',
                    verticalAlign: 'middle',
                    height: '13px',
                    animation: 'blink-cursor 1s step-end infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Countdown + cancel */}
          {!cancelled ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Redirecting in{' '}
                <span
                  style={{
                    color: 'var(--color-accent)',
                    fontWeight: '600',
                    fontSize: '16px',
                    display: 'inline-block',
                    minWidth: '16px',
                  }}
                >
                  {countdown}
                </span>
                {countdown === 1 ? ' second' : ' seconds'}...
              </span>

              <button
                type="button"
                onClick={handleCancel}
                data-cursor="pointer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  background: 'transparent',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  transition: 'color 150ms, border-color 150ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-strong)';
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Redirect cancelled.
              </span>
              <button
                type="button"
                onClick={() => router.push('/')}
                data-cursor="pointer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--color-accent)',
                  background: 'transparent',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                ← Go home
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}