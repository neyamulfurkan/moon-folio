'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { Experience } from '@/types/index';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ExperienceNode } from '@/components/ui/ExperienceNode';
import { SectionTransition } from '@/components/ui/SectionTransition';

type ExperienceSectionProps = {
  experience: Experience[];
};

const TIMELINE_CENTER_X = 50; // percentage
const NODE_RADIUS = 8;
const BRANCH_LENGTH = 48;

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const isReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const wirePathRef = useRef<SVGPathElement>(null);
  const [wireAnimated, setWireAnimated] = useState(false);
  const [headingGlowed, setHeadingGlowed] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const headingParenControls = useAnimationControls();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = (): void => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Wire draw animation
  useEffect(() => {
    if (isReduced) {
      setWireAnimated(true);
      return;
    }

    const wirePath = wirePathRef.current;
    if (!wirePath) return;

    const totalLength = wirePath.getTotalLength();
    wirePath.style.strokeDasharray = `${totalLength}`;
    wirePath.style.strokeDashoffset = `${totalLength}`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !wireAnimated) {
            setWireAnimated(true);
            wirePath.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)';
            wirePath.style.strokeDashoffset = '0';
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(wirePath);
    return () => observer.disconnect();
  }, [isReduced, wireAnimated]);

  // Heading glow animation on section enter
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !headingGlowed) {
            setHeadingGlowed(true);
            void headingParenControls.start({
              textShadow: [
                '0 0 0px var(--color-accent)',
                '0 0 12px var(--color-accent)',
                '0 0 0px var(--color-accent)',
              ],
              transition: { duration: 0.6, times: [0, 0.4, 1] },
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [headingGlowed, headingParenControls]);

  // Node visibility observers
  const setNodeRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        nodeRefs.current.set(id, el);
      } else {
        nodeRefs.current.delete(id);
      }
    },
    []
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    nodeRefs.current.forEach((el, id) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleNodes((prev) => new Set([...prev, id]));
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [experience]);

  const getSide = (exp: Experience, index: number): 'left' | 'right' => {
    if (isMobile) return 'left';
    // work on left, education on right; if all same type, alternate
    const allSameType = experience.every((e) => e.type === experience[0]?.type);
    if (allSameType) return index % 2 === 0 ? 'left' : 'right';
    return exp.type === 'work' ? 'left' : 'right';
  };

  // Build SVG wire path with PCB-style horizontal jogs at node positions
  const buildWirePath = (nodeCount: number): string => {
    if (nodeCount === 0) return 'M 50 20 L 50 980';
    const segments: string[] = [];
    const startY = 80;
    const endY = 920;
    const totalHeight = endY - startY;
    const spacing = nodeCount > 1 ? totalHeight / (nodeCount - 1) : totalHeight;

    segments.push(`M 50 ${startY}`);

    for (let i = 0; i < nodeCount; i++) {
      const nodeY = nodeCount === 1 ? startY + totalHeight / 2 : startY + i * spacing;
      const jogX = i % 2 === 0 ? 52 : 48;
      segments.push(`L ${jogX} ${nodeY - 4}`);
      segments.push(`L 50 ${nodeY}`);
      if (i < nodeCount - 1) {
        segments.push(`L ${jogX} ${nodeY + 4}`);
      }
    }

    segments.push(`L 50 ${endY}`);
    return segments.join(' ');
  };

  const wirePath = buildWirePath(experience.length);

  const getNodeY = (index: number): number => {
    if (experience.length === 0) return 500;
    const startY = 80;
    const endY = 920;
    const totalHeight = endY - startY;
    if (experience.length === 1) return startY + totalHeight / 2;
    return startY + (index * totalHeight) / (experience.length - 1);
  };

  return (
    <SectionTransition id="experience" label="experience.tsx" zIndex={40}>
      <div ref={sectionRef} style={{ position: 'relative', minHeight: '100vh', padding: '80px 24px 80px' }}>
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>timeline</span>
            <motion.span
              animate={headingParenControls}
              style={{
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                display: 'inline-block',
              }}
            >
              .exec()
            </motion.span>
          </h2>
        </div>

        {experience.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              marginTop: '80px',
            }}
          >
            // no experience entries yet
          </div>
        ) : (
          <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
            {/* SVG Timeline */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <svg
                viewBox="0 0 100 1000"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                {/* Main wire path */}
                <path
                  ref={wirePathRef}
                  d={wirePath}
                  stroke="var(--color-accent)"
                  strokeOpacity={isReduced || wireAnimated ? 0.4 : 0}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={
                    isReduced
                      ? { strokeOpacity: 0.4 }
                      : {}
                  }
                />

                {/* Branch lines and node circles */}
                {experience.map((exp, index) => {
                  const nodeY = getNodeY(index);
                  const side = getSide(exp, index);
                  const branchDirection = side === 'left' ? -1 : 1;
                  const branchEndX = 50 + branchDirection * BRANCH_LENGTH;

                  return (
                    <g key={exp.id}>
                      {/* Branch line */}
                      <line
                        x1={50}
                        y1={nodeY}
                        x2={branchEndX}
                        y2={nodeY}
                        stroke="var(--color-border-default)"
                        strokeWidth="1"
                        opacity={wireAnimated || isReduced ? 1 : 0}
                        style={{
                          transition: wireAnimated ? 'opacity 400ms ease' : undefined,
                          transitionDelay: wireAnimated ? `${index * 100 + 600}ms` : undefined,
                        }}
                      />

                      {/* Node circle with pulsing animation */}
                      <motion.circle
                        cx={50}
                        cy={nodeY}
                        r={NODE_RADIUS}
                        fill="var(--color-accent)"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={
                          wireAnimated || isReduced
                            ? {
                                opacity: [1, 0.7, 1],
                                scale: 1,
                              }
                            : { opacity: 0, scale: 0 }
                        }
                        transition={
                          isReduced
                            ? { duration: 0.2 }
                            : {
                                scale: {
                                  duration: 0.3,
                                  delay: index * 0.1 + 0.5,
                                },
                                opacity: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                  delay: index * 0.4,
                                  repeatDelay: 0,
                                },
                              }
                        }
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Experience cards */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '32px' : '48px',
                paddingTop: '0',
              }}
            >
              {experience.map((exp, index) => {
                const side = getSide(exp, index);
                const isVisible = visibleNodes.has(exp.id);

                return (
                  <div
                    key={exp.id}
                    ref={setNodeRef(exp.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 1fr',
                      alignItems: 'center',
                      gap: '0',
                    }}
                  >
                    {/* Left column */}
                    {!isMobile ? (
                      <div style={{ paddingRight: '24px' }}>
                        {side === 'left' ? (
                          <ExperienceNode
                            experience={exp}
                            index={index + 1}
                            side="left"
                            isVisible={isVisible}
                          />
                        ) : (
                          <div />
                        )}
                      </div>
                    ) : null}

                    {/* Center spacer (desktop only) */}
                    {!isMobile && <div style={{ width: '80px' }} />}

                    {/* Right column */}
                    {!isMobile ? (
                      <div style={{ paddingLeft: '24px' }}>
                        {side === 'right' ? (
                          <ExperienceNode
                            experience={exp}
                            index={index + 1}
                            side="right"
                            isVisible={isVisible}
                          />
                        ) : (
                          <div />
                        )}
                      </div>
                    ) : (
                      <ExperienceNode
                        experience={exp}
                        index={index + 1}
                        side="left"
                        isVisible={isVisible}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SectionTransition>
  );
};