'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SparkCharacter } from '@/components/character/SparkCharacter';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { cn } from '@/lib/utils';

type Testimonial = {
  name: string;
  role: string;
  text: string;
};

type AboutSectionProps = {
  stats?: {
    projects: number;
    years: number;
    hardwareProjects: number;
  };
  profilePhotoUrl?: string;
  availabilityStatus?: string;
  availabilityLabel?: string;
  testimonials?: Testimonial[];
};

type StatItem = {
  label: string;
  value: number;
  suffix: string;
};

const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

const useCounterAnimation = (
  target: number,
  duration: number,
  isReduced: boolean
): { current: number; done: boolean } => {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  const animate = useCallback(
    (startTime: number) => {
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuad(progress);
        setCurrent(Math.round(eased * target));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setCurrent(target);
          setDone(true);
        }
      };
      requestAnimationFrame(step);
    },
    [target, duration]
  );

  return { current: isReduced ? target : current, done: isReduced ? true : done };
};

type SingleCounterProps = {
  stat: StatItem;
  shouldStart: boolean;
  isReduced: boolean;
};

const SingleCounter: React.FC<SingleCounterProps> = ({ stat, shouldStart, isReduced }) => {
  const [started, setStarted] = useState(false);
  const [showSuffix, setShowSuffix] = useState(false);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (shouldStart && !hasRunRef.current) {
      hasRunRef.current = true;
      setStarted(true);
    }
  }, [shouldStart]);

  const { current, done } = useCounterAnimation(
    started ? stat.value : 0,
    1200,
    isReduced
  );

  useEffect(() => {
    if (done && !showSuffix) {
      const t = setTimeout(() => setShowSuffix(true), 150);
      return () => clearTimeout(t);
    }
  }, [done, showSuffix]);

  const displayValue = started || isReduced ? current : 0;
  const displaySuffix = isReduced || showSuffix;

  return (
    <div style={{ textAlign: 'center', minWidth: '120px' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '48px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '2px',
        }}
      >
        <span>{displayValue}</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: displaySuffix ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '28px',
            color: 'var(--color-accent)',
            fontWeight: 400,
          }}
        >
          {stat.suffix}
        </motion.span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          marginTop: '8px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {stat.label}
      </div>
    </div>
  );
};

const HeadingWithCursor: React.FC<{ triggered: boolean; isReduced: boolean }> = ({
  triggered,
  isReduced,
}) => {
  const [glowing, setGlowing] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!triggered || hasAnimatedRef.current || isReduced) return;
    hasAnimatedRef.current = true;

    setGlowing(true);
    setShowCursor(true);

    const glowOff = setTimeout(() => setGlowing(false), 200);
    const cursorOff = setTimeout(() => setShowCursor(false), 1500);

    return () => {
      clearTimeout(glowOff);
      clearTimeout(cursorOff);
    };
  }, [triggered, isReduced]);

  const parenStyle: React.CSSProperties = {
    color: 'var(--color-accent)',
    transition: 'text-shadow 0.1s ease',
    textShadow: glowing ? '0 0 8px var(--color-accent)' : 'none',
  };

  return (
    <h2
      style={{
        fontSize: '32px',
        fontWeight: 600,
        lineHeight: 1.2,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0,
        flexWrap: 'wrap',
      }}
    >
      <span className="font-mono" style={{ color: 'var(--color-text-primary)' }}>
        sys
      </span>
      <span style={{ color: 'var(--color-text-primary)' }}>.whoami</span>
      <span className="font-mono" style={parenStyle}>
        ()
      </span>
      {showCursor && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent)',
            marginLeft: '4px',
            animation: 'blink 1s step-end infinite',
          }}
        >
          |
        </span>
      )}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulseTrace {
          0% { offset-distance: 0%; opacity: 1; }
          80% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
      `}</style>
    </h2>
  );
};

const CircuitSchematic: React.FC<{ isReduced: boolean }> = ({ isReduced }) => {
  // PCB traces: right-angle only
  // Trace 1: horizontal from left to center, then up to MCU
  const trace1 = 'M 30 160 L 160 160 L 160 80';
  // Trace 2: from MCU right, horizontal to PSU
  const trace2 = 'M 220 60 L 320 60 L 320 100';
  // Trace 3: from PSU down, right to AND gate
  const trace3 = 'M 320 160 L 320 200 L 400 200';

  const pulseAnimation = (delay: number): string =>
    `pulseTrace 2s linear ${delay}s infinite`;

  return (
    <motion.svg
      viewBox="0 0 480 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '440px' }}
      initial={{ opacity: 0.2 }}
      animate={isReduced ? { opacity: 0.2 } : { opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      {/* Define paths for offset-path animation */}
      <defs>
        <path id="trace1Path" d={trace1} />
        <path id="trace2Path" d={trace2} />
        <path id="trace3Path" d={trace3} />
      </defs>

      {/* PCB Traces */}
      <path
        d={trace1}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={trace2}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={trace3}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* MCU Component */}
      <rect x="150" y="40" width="70" height="40" rx="3" fill="none" stroke="var(--color-accent)" strokeOpacity="0.5" strokeWidth="1" />
      <text x="185" y="58" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-accent)" fillOpacity="0.7">MCU</text>
      <text x="185" y="70" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="var(--color-accent)" fillOpacity="0.5">STM32</text>
      {/* IC pin marks */}
      {[0, 1, 2].map((i) => (
        <line key={`mcu-pin-l-${i}`} x1="144" y1={48 + i * 10} x2="150" y2={48 + i * 10} stroke="var(--color-accent)" strokeOpacity="0.4" strokeWidth="1" />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={`mcu-pin-r-${i}`} x1="220" y1={48 + i * 10} x2="226" y2={48 + i * 10} stroke="var(--color-accent)" strokeOpacity="0.4" strokeWidth="1" />
      ))}

      {/* PSU Component */}
      <rect x="290" y="80" width="60" height="40" rx="3" fill="none" stroke="var(--color-accent)" strokeOpacity="0.5" strokeWidth="1" />
      <text x="320" y="98" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-accent)" fillOpacity="0.7">PSU</text>
      <text x="320" y="110" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="var(--color-accent)" fillOpacity="0.5">3.3V</text>

      {/* AND Gate */}
      <path
        d="M 395 185 L 395 215 L 415 215 Q 435 215 435 200 Q 435 185 415 185 Z"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <text x="410" y="204" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="var(--color-accent)" fillOpacity="0.7">AND</text>
      {/* AND gate inputs */}
      <line x1="385" y1="191" x2="395" y2="191" stroke="var(--color-accent)" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="385" y1="209" x2="395" y2="209" stroke="var(--color-accent)" strokeOpacity="0.4" strokeWidth="1" />

      {/* Solder pad dots at trace joints */}
      {[
        { cx: 160, cy: 160 },
        { cx: 320, cy: 60 },
        { cx: 320, cy: 200 },
      ].map((pt, i) => (
        <circle
          key={`pad-${i}`}
          cx={pt.cx}
          cy={pt.cy}
          r="3"
          fill="var(--color-accent)"
          fillOpacity="0.5"
        />
      ))}

      {/* Pulse dots on traces — using inline style with CSS animation */}
      {!isReduced && (
        <>
          <circle r="3" fill="var(--color-accent)">
            <animateMotion dur="2s" repeatCount="indefinite" begin="0s">
              <mpath href="#trace1Path" />
            </animateMotion>
          </circle>
          <circle r="3" fill="var(--color-accent)" opacity="0.7">
            <animateMotion dur="2s" repeatCount="indefinite" begin="0.8s">
              <mpath href="#trace1Path" />
            </animateMotion>
          </circle>
          <circle r="3" fill="var(--color-accent)">
            <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.3s">
              <mpath href="#trace2Path" />
            </animateMotion>
          </circle>
          <circle r="3" fill="var(--color-accent)" opacity="0.6">
            <animateMotion dur="2.2s" repeatCount="indefinite" begin="0s">
              <mpath href="#trace3Path" />
            </animateMotion>
          </circle>
          <circle r="3" fill="var(--color-accent)" opacity="0.8">
            <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.1s">
              <mpath href="#trace3Path" />
            </animateMotion>
          </circle>
        </>
      )}
    </motion.svg>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({
  stats,
  profilePhotoUrl,
  availabilityStatus = 'open',
  availabilityLabel = 'Available for freelance & internships',
  testimonials = [],
}) => {
  const isReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [headingTriggered, setHeadingTriggered] = useState(false);
  const visibilityRef = useRef(false);

  const resolvedStats: StatItem[] = [
    { label: 'Projects Built', value: stats?.projects ?? 12, suffix: '+' },
    { label: 'Years Coding', value: stats?.years ?? 3, suffix: '+' },
    { label: 'Hardware Projects', value: stats?.hardwareProjects ?? 5, suffix: '+' },
    { label: 'Coffee Dependency', value: 99, suffix: '+' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibilityRef.current) {
            visibilityRef.current = true;
            setSectionVisible(true);
            setHeadingTriggered(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <SectionTransition id="about" label="// about" zIndex={20} bgColor="primary">
      <div ref={sectionRef} style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Ghost Spark — upper right, aria-hidden */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            opacity: 0.3,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <SparkCharacter size="ghost" showChat={false} className="hidden md:block" />
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '112px 48px 80px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'start',
          }}
          className="about-grid"
        >
          <style>{`
            @media (max-width: 768px) {
              .about-grid {
                grid-template-columns: 1fr !important;
                padding: 48px 24px !important;
                gap: 40px !important;
              }
            }
          `}</style>

          {/* Left column: heading, bio, schematic */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <HeadingWithCursor triggered={headingTriggered} isReduced={isReduced} />

            {/* Bio text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                }}
              >
                I&apos;m Moon — an Electrical and Electronics Engineering student who
                somehow also builds production web applications. I work across the full
                stack, from database schema to pixel-level UI, while occasionally
                soldering things that shouldn&apos;t be soldered.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                }}
              >
                My engineering background shapes how I write code — systematically,
                with an eye for signal integrity and resource constraints. Building a
                web app feels similar to designing a circuit: you pick the right
                components, define clean interfaces, and make sure nothing draws too
                much power.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                }}
              >
                I&apos;m open to freelance projects, internships, and collaborations —
                especially ones that sit at the intersection of hardware and software.
                If you&apos;re building something interesting, let&apos;s talk.
              </p>
            </div>

            {/* Availability badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    availabilityStatus === 'open'
                      ? 'var(--color-success)'
                      : availabilityStatus === 'busy'
                      ? 'var(--color-electric)'
                      : 'var(--color-danger)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {availabilityLabel}
              </span>
            </div>

            {/* Circuit schematic */}
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '12px',
                  letterSpacing: '0.06em',
                }}
              >
                // skills.schematic.svg
              </div>
              <CircuitSchematic isReduced={isReduced} />
            </div>
          </div>

          {/* Right column: stats + photo + testimonials */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '48px',
              paddingTop: '16px',
            }}
          >
            {/* Profile photo */}
            {profilePhotoUrl && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profilePhotoUrl}
                  alt="Moon — profile photo"
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-border-strong)',
                  }}
                />
              </div>
            )}
            {/* Stats grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px 24px',
              }}
            >
              {resolvedStats.map((stat) => (
                <SingleCounter
                  key={stat.label}
                  stat={stat}
                  shouldStart={sectionVisible}
                  isReduced={isReduced}
                />
              ))}
            </div>

            {/* Divider */}
            <div
              aria-hidden="true"
              style={{
                height: '1px',
                background:
                  'linear-gradient(to right, var(--color-border-default), transparent)',
              }}
            />

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  // what people say
                </div>
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--color-text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {t.name}
                      </div>
                      {t.role && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--color-text-tertiary)',
                            marginTop: '2px',
                          }}
                        >
                          {t.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tech snapshot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                // currently focused on
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Next.js 14',
                  'TypeScript',
                  'Prisma ORM',
                  'Framer Motion',
                  'PCB Design',
                  'STM32',
                  'PostgreSQL',
                  'Tailwind CSS',
                ].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionTransition>
  );
};