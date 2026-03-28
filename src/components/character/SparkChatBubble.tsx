'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type SparkChatBubbleProps = {
  visible: boolean;
  onMobile?: boolean;
};

const CLICK_ME_TEXT = '// click me';

export const SparkChatBubble: React.FC<SparkChatBubbleProps> = ({
  visible,
  onMobile = false,
}) => {
  const isReduced = useReducedMotion();
  const [visibleCharCount, setVisibleCharCount] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setVisibleCharCount(0);
      setTypingComplete(false);
      return;
    }

    if (isReduced) {
      setVisibleCharCount(CLICK_ME_TEXT.length);
      setTypingComplete(true);
      return;
    }

    setVisibleCharCount(0);
    setTypingComplete(false);

    intervalRef.current = setInterval(() => {
      setVisibleCharCount((prev) => {
        const next = prev + 1;
        if (next >= CLICK_ME_TEXT.length) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setTypingComplete(true);
          return next;
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, isReduced]);

  if (onMobile) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            key="mobile-pill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              bottom: '-36px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 14px',
              borderRadius: '16px',
              border: '1px solid var(--color-border-default)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            tap to talk
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="desktop-bubble"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            top: '-10px',
            left: '-60px',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Speech bubble SVG */}
          <svg
            width="120"
            height="52"
            viewBox="0 0 120 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            overflow="visible"
          >
            {/* Rounded rect bubble */}
            <rect
              x="1"
              y="1"
              width="118"
              height="38"
              rx="8"
              fill="transparent"
              stroke="rgba(0,212,255,0.4)"
              strokeWidth="1"
            />
            {/* Triangular tail pointing down-right toward Spark's head */}
            <path
              d="M80 39 L88 50 L94 41"
              fill="transparent"
              stroke="rgba(0,212,255,0.4)"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Three pulsing dots */}
            {isReduced ? (
              <>
                <circle cx="44" cy="20" r="3" fill="var(--color-text-secondary)" opacity="0.7" />
                <circle cx="60" cy="20" r="3" fill="var(--color-text-secondary)" opacity="0.7" />
                <circle cx="76" cy="20" r="3" fill="var(--color-text-secondary)" opacity="0.7" />
              </>
            ) : (
              <>
                <circle
                  cx="44"
                  cy="20"
                  r="3"
                  fill="var(--color-text-secondary)"
                  className="spark-dot-1"
                />
                <circle
                  cx="60"
                  cy="20"
                  r="3"
                  fill="var(--color-text-secondary)"
                  className="spark-dot-2"
                />
                <circle
                  cx="76"
                  cy="20"
                  r="3"
                  fill="var(--color-text-secondary)"
                  className="spark-dot-3"
                />
              </>
            )}

            <style>{`
              @keyframes sparkDotBounce {
                0%, 100% { transform: translateY(0); opacity: 0.7; }
                50% { transform: translateY(-4px); opacity: 1; }
              }
              .spark-dot-1 {
                animation: sparkDotBounce 1.5s ease-in-out infinite;
                animation-delay: 0ms;
              }
              .spark-dot-2 {
                animation: sparkDotBounce 1.5s ease-in-out infinite;
                animation-delay: 150ms;
              }
              .spark-dot-3 {
                animation: sparkDotBounce 1.5s ease-in-out infinite;
                animation-delay: 300ms;
              }
            `}</style>
          </svg>

          {/* Typewriter text below bubble */}
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              opacity: typingComplete ? 1 : 0.85,
              transition: typingComplete ? 'opacity 200ms ease' : 'none',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
            aria-label={CLICK_ME_TEXT}
          >
            {CLICK_ME_TEXT.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  opacity: i < visibleCharCount ? 1 : 0,
                  display: 'inline',
                }}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};