'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

type NavLink = {
  label: string;
  href: string;
  sectionId: string;
};

const NAV_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#about', sectionId: 'about' },
  { label: 'Skills', href: '#skills', sectionId: 'skills' },
  { label: 'Projects', href: '#projects', sectionId: 'projects' },
  { label: 'Experience', href: '#experience', sectionId: 'experience' },
  { label: 'Contact', href: '#contact', sectionId: 'contact' },
] as const;

type HeaderProps = {
  cvUrl?: string;
  githubUrl?: string;
};

export const Header: React.FC<HeaderProps> = ({ cvUrl, githubUrl }) => {
  const { isScrolled } = useScrollProgress();
  const isReduced = useReducedMotion();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Section tracker based on scroll position
  useEffect(() => {
    const sectionOrder = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

    const handleScroll = (): void => {
      const index = Math.round(window.scrollY / window.innerHeight);
      const clampedIndex = Math.max(0, Math.min(index, sectionOrder.length - 1));
      const activeId = sectionOrder[clampedIndex];
      if (activeId !== undefined) {
        setActiveSection(activeId === 'hero' ? null : activeId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // On mount, if URL has a hash (e.g. navigated from project detail page), scroll to that section
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashSection = window.location.hash.replace('#', '');
      if (sectionOrder.includes(hashSection)) {
        // Use rAF to wait for page to fully render before scrolling
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const index = sectionOrder.indexOf(hashSection);
            const scrollTop = index * window.innerHeight;
            window.scrollTo({ top: scrollTop, behavior: 'auto' });
            // Clean up the hash from the URL without triggering navigation
            window.history.replaceState(null, '', window.location.pathname);
          });
        });
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleTab = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      const first = firstFocusableRef.current;
      const last = lastFocusableRef.current;
      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    // Focus first focusable element in menu
    firstFocusableRef.current?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [mobileMenuOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback(
    (sectionId: string): void => {
      const sectionOrder = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
      const index = sectionOrder.indexOf(sectionId);
      if (index === -1) return;
      const scrollTop = index * window.innerHeight;
      window.scrollTo({ top: scrollTop, behavior: isReduced ? 'auto' : 'smooth' });
    },
    [isReduced]
  );

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      if (!isHomePage) {
        // Let the browser follow the /#section link natively — no preventDefault
        return;
      }
      e.preventDefault();
      const sectionId = href.replace('#', '');
      scrollToSection(sectionId);
      setMobileMenuOpen(false);
    },
    [scrollToSection, isHomePage]
  );

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>): void => {
      if (!isHomePage) {
        // Let browser navigate to / natively
        return;
      }
      e.preventDefault();
      scrollToSection('hero');
    },
    [scrollToSection, isHomePage]
  );

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Skip link */}
      <a
        href="#main"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-4 focus:left-4 focus:z-[300]',
          'focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-mono',
          'focus:bg-[var(--color-accent)] focus:text-[var(--color-bg-primary)]'
        )}
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className={cn(
          'overflow-hidden',
          isScrolled ? 'header-scrolled' : '',
          'fixed top-0 left-0 right-0 h-16',
          'flex items-center justify-between px-6',
          'transition-[background-color,border-color]',
          isReduced ? 'duration-0' : 'duration-300',
          'border-b border-[rgba(0,212,255,0.15)]',
          'z-[150]'
        )}
        style={{
          zIndex: 150,
          backgroundColor: 'rgba(8, 12, 22, 0.92)',
          backdropFilter: 'blur(20px) saturate(130%)',
          WebkitBackdropFilter: 'blur(20px) saturate(130%)',
          backgroundImage: [
            'radial-gradient(ellipse 140% 100% at 15% -40%, rgba(20, 50, 80, 0.55) 0%, transparent 55%)',
            'radial-gradient(ellipse 120% 80% at 85% -30%, rgba(15, 40, 65, 0.45) 0%, transparent 55%)',
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 180, 255, 0.07) 0%, transparent 65%)',
            'linear-gradient(180deg, rgba(10, 18, 35, 0.6) 0%, rgba(7, 9, 15, 0.4) 100%)',
          ].join(', '),
          boxShadow: '0 1px 0 rgba(0, 212, 255, 0.15), 0 4px 32px rgba(0, 0, 0, 0.6)',
        } as React.CSSProperties}
      >
        {/* Animated rain + clouds */}

        {/* Clouds + rain together — rain only falls from cloud positions */}
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          viewBox="0 0 1800 64"
          preserveAspectRatio="xMinYMin slice"
        >
          <defs>
            <filter id="hdr-blur"><feGaussianBlur stdDeviation="7"/></filter>
          </defs>

          {/* Layer 1 — drifts right over 40s. Clouds at cx 150,420,700,950,1200,1500,1750 */}
          <g>
            <animateTransform attributeName="transform" type="translate" from="-900 0" to="0 0" dur="40s" repeatCount="indefinite"/>
            {/* Clouds */}
            <ellipse cx="150"  cy="8"  rx="150" ry="22" fill="#1e4060" opacity="0.65" filter="url(#hdr-blur)"/>
            <ellipse cx="420"  cy="5"  rx="170" ry="24" fill="#17344d" opacity="0.60" filter="url(#hdr-blur)"/>
            <ellipse cx="700"  cy="12" rx="140" ry="20" fill="#1c3d5a" opacity="0.58" filter="url(#hdr-blur)"/>
            <ellipse cx="950"  cy="4"  rx="130" ry="19" fill="#193550" opacity="0.62" filter="url(#hdr-blur)"/>
            <ellipse cx="1200" cy="10" rx="160" ry="22" fill="#1a3855" opacity="0.55" filter="url(#hdr-blur)"/>
            <ellipse cx="1500" cy="6"  rx="140" ry="20" fill="#1e4060" opacity="0.60" filter="url(#hdr-blur)"/>
            <ellipse cx="1750" cy="14" rx="120" ry="18" fill="#17344d" opacity="0.52" filter="url(#hdr-blur)"/>
            {/* Rain under cloud at cx~150 (x: 80–220) */}
            {[88,105,122,139,156,173,190,207].map((x,i) => (
              <line key={`r1a${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.13+((i*3)%7)*0.01}>
                <animate attributeName="y1" from={-8-(i%5)*5} to={72} dur={`${0.9+(i%4)*0.14}s`} begin={`${(i*0.19)%1.8}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-8-(i%5)*5+6} to={78} dur={`${0.9+(i%4)*0.14}s`} begin={`${(i*0.19)%1.8}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~420 (x: 310–530) */}
            {[318,338,358,378,398,418,438,458,478,498,518].map((x,i) => (
              <line key={`r1b${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.13+((i*5)%6)*0.01}>
                <animate attributeName="y1" from={-10-(i%6)*4} to={72} dur={`${0.85+(i%5)*0.13}s`} begin={`${(i*0.17)%1.6}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-10-(i%6)*4+6} to={78} dur={`${0.85+(i%5)*0.13}s`} begin={`${(i*0.17)%1.6}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~700 (x: 590–810) */}
            {[598,618,638,658,678,698,718,738,758,778,798].map((x,i) => (
              <line key={`r1c${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.12+((i*4)%7)*0.01}>
                <animate attributeName="y1" from={-6-(i%5)*5} to={72} dur={`${0.9+(i%4)*0.15}s`} begin={`${(i*0.21)%1.9}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-6-(i%5)*5+6} to={78} dur={`${0.9+(i%4)*0.15}s`} begin={`${(i*0.21)%1.9}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~950 (x: 855–1045) */}
            {[862,882,902,922,942,962,982,1002,1022,1038].map((x,i) => (
              <line key={`r1d${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.13+((i*3)%6)*0.01}>
                <animate attributeName="y1" from={-8-(i%5)*4} to={72} dur={`${0.88+(i%4)*0.13}s`} begin={`${(i*0.18)%1.7}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-8-(i%5)*4+6} to={78} dur={`${0.88+(i%4)*0.13}s`} begin={`${(i*0.18)%1.7}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~1200 (x: 1080–1320) */}
            {[1088,1110,1132,1154,1176,1198,1220,1242,1264,1286,1308].map((x,i) => (
              <line key={`r1e${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.12+((i*4)%7)*0.01}>
                <animate attributeName="y1" from={-9-(i%6)*4} to={72} dur={`${0.92+(i%5)*0.12}s`} begin={`${(i*0.20)%1.8}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-9-(i%6)*4+6} to={78} dur={`${0.92+(i%5)*0.12}s`} begin={`${(i*0.20)%1.8}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~1500 (x: 1395–1605) */}
            {[1402,1422,1442,1462,1482,1502,1522,1542,1562,1582].map((x,i) => (
              <line key={`r1f${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.13+((i*3)%6)*0.01}>
                <animate attributeName="y1" from={-7-(i%5)*5} to={72} dur={`${0.87+(i%4)*0.14}s`} begin={`${(i*0.16)%1.6}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-7-(i%5)*5+6} to={78} dur={`${0.87+(i%4)*0.14}s`} begin={`${(i*0.16)%1.6}s`} repeatCount="indefinite"/>
              </line>
            ))}
          </g>

          {/* Layer 2 — drifts left over 55s. Clouds at cx 250,550,850,1100,1400,1650 */}
          <g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-900 0" dur="55s" repeatCount="indefinite"/>
            {/* Clouds */}
            <ellipse cx="250"  cy="14" rx="120" ry="16" fill="#162e45" opacity="0.45" filter="url(#hdr-blur)"/>
            <ellipse cx="550"  cy="8"  rx="180" ry="20" fill="#1b3a55" opacity="0.42" filter="url(#hdr-blur)"/>
            <ellipse cx="850"  cy="16" rx="130" ry="18" fill="#193050" opacity="0.48" filter="url(#hdr-blur)"/>
            <ellipse cx="1100" cy="6"  rx="150" ry="22" fill="#1c3d5a" opacity="0.44" filter="url(#hdr-blur)"/>
            <ellipse cx="1400" cy="10" rx="110" ry="16" fill="#162e45" opacity="0.40" filter="url(#hdr-blur)"/>
            <ellipse cx="1650" cy="4"  rx="140" ry="20" fill="#1b3a55" opacity="0.46" filter="url(#hdr-blur)"/>
            {/* Rain under cloud at cx~250 (x: 165–335) */}
            {[172,192,212,232,252,272,292,312].map((x,i) => (
              <line key={`r2a${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.11+((i*4)%6)*0.01}>
                <animate attributeName="y1" from={-8-(i%5)*4} to={72} dur={`${0.9+(i%4)*0.13}s`} begin={`${(i*0.22)%2.0}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-8-(i%5)*4+6} to={78} dur={`${0.9+(i%4)*0.13}s`} begin={`${(i*0.22)%2.0}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~550 (x: 415–685) */}
            {[422,444,466,488,510,532,554,576,598,620,642,664].map((x,i) => (
              <line key={`r2b${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.12+((i*3)%7)*0.01}>
                <animate attributeName="y1" from={-6-(i%6)*5} to={72} dur={`${0.88+(i%5)*0.14}s`} begin={`${(i*0.18)%1.7}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-6-(i%6)*5+6} to={78} dur={`${0.88+(i%5)*0.14}s`} begin={`${(i*0.18)%1.7}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~850 (x: 755–945) */}
            {[762,782,802,822,842,862,882,902,922,938].map((x,i) => (
              <line key={`r2c${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.13+((i*5)%6)*0.01}>
                <animate attributeName="y1" from={-9-(i%5)*4} to={72} dur={`${0.91+(i%4)*0.13}s`} begin={`${(i*0.19)%1.8}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-9-(i%5)*4+6} to={78} dur={`${0.91+(i%4)*0.13}s`} begin={`${(i*0.19)%1.8}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~1100 (x: 985–1215) */}
            {[992,1014,1036,1058,1080,1102,1124,1146,1168,1190,1208].map((x,i) => (
              <line key={`r2d${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.12+((i*4)%7)*0.01}>
                <animate attributeName="y1" from={-7-(i%6)*4} to={72} dur={`${0.89+(i%5)*0.12}s`} begin={`${(i*0.21)%1.9}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-7-(i%6)*4+6} to={78} dur={`${0.89+(i%5)*0.12}s`} begin={`${(i*0.21)%1.9}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~1400 (x: 1320–1480) */}
            {[1328,1348,1368,1388,1408,1428,1448,1468].map((x,i) => (
              <line key={`r2e${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.11+((i*3)%6)*0.01}>
                <animate attributeName="y1" from={-8-(i%5)*5} to={72} dur={`${0.86+(i%4)*0.15}s`} begin={`${(i*0.17)%1.6}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-8-(i%5)*5+6} to={78} dur={`${0.86+(i%4)*0.15}s`} begin={`${(i*0.17)%1.6}s`} repeatCount="indefinite"/>
              </line>
            ))}
            {/* Rain under cloud at cx~1650 (x: 1545–1755) */}
            {[1552,1572,1592,1612,1632,1652,1672,1692,1712,1738].map((x,i) => (
              <line key={`r2f${i}`} x1={x} x2={x-1} stroke="#bfdbfe" strokeWidth="0.5" strokeLinecap="round" opacity={0.12+((i*4)%7)*0.01}>
                <animate attributeName="y1" from={-10-(i%5)*4} to={72} dur={`${0.92+(i%4)*0.13}s`} begin={`${(i*0.20)%1.8}s`} repeatCount="indefinite"/>
                <animate attributeName="y2" from={-10-(i%5)*4+6} to={78} dur={`${0.92+(i%4)*0.13}s`} begin={`${(i*0.20)%1.8}s`} repeatCount="indefinite"/>
              </line>
            ))}
          </g>
        </svg>



        {/* Logo */}
        <a
          href={isHomePage ? '#hero' : '/'}
          onClick={handleLogoClick}
          className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-150 select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '18px',
            letterSpacing: '-0.01em',
          }}
          aria-label={`${SITE_NAME} — scroll to top`}
        >
          {SITE_NAME}
        </a>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.sectionId;
            return (
              <a
                key={link.sectionId}
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'relative flex flex-col items-center pb-1 text-sm transition-colors duration-150',
                  'focus-visible:outline-[var(--color-accent)]',
                  isActive
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-0.5 h-[3px] w-[3px] rounded-full bg-[var(--color-accent)]',
                    'transition-opacity duration-150',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              data-cursor="pointer"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          )}

          {cvUrl && (
            <a
              href={cvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="pointer"
              className={cn(
                'px-3 py-1.5 rounded text-[13px] font-mono',
                'border border-[var(--color-border-strong)]',
                'text-[var(--color-text-primary)]',
                'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                'transition-colors duration-150'
              )}
            >
              Download CV
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          onClick={toggleMobileMenu}
          data-cursor="pointer"
          className={cn(
            'md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]',
            'text-[var(--color-text-primary)]',
            'focus-visible:outline-[var(--color-accent)] rounded'
          )}
        >
          <span
            className={cn(
              'block w-5 h-px bg-current',
              'transition-transform origin-center',
              isReduced ? 'duration-0' : 'duration-200',
              mobileMenuOpen ? 'translate-y-[6px] rotate-45' : ''
            )}
          />
          <span
            className={cn(
              'block w-5 h-px bg-current',
              'transition-opacity',
              isReduced ? 'duration-0' : 'duration-200',
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            )}
          />
          <span
            className={cn(
              'block w-5 h-px bg-current',
              'transition-transform origin-center',
              isReduced ? 'duration-0' : 'duration-200',
              mobileMenuOpen ? '-translate-y-[6px] -rotate-45' : ''
            )}
          />
        </button>
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-[var(--color-bg-primary)] md:hidden"
          style={{ zIndex: 140 }}
          onClick={() => {
            setMobileMenuOpen(false);
            hamburgerRef.current?.focus();
          }}
        />
      )}

      {/* Mobile nav overlay */}
      <div
        id="mobile-nav"
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-0 md:hidden',
          'flex flex-col items-center justify-center gap-8',
          'bg-[var(--color-bg-primary)]',
          'transition-opacity',
          isReduced ? 'duration-0' : 'duration-200',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ zIndex: 145 }}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-6">
          {NAV_LINKS.map((link, index) => {
            const isFirst = index === 0;
            const isActive = activeSection === link.sectionId;
            return (
              <a
                key={link.sectionId}
                href={isHomePage ? link.href : `/${link.href}`}
                ref={isFirst ? firstFocusableRef : undefined}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, link.href);
                }}
                tabIndex={mobileMenuOpen ? 0 : -1}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'text-2xl font-display transition-colors duration-150',
                  'focus-visible:outline-[var(--color-accent)] rounded px-2',
                  isActive
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4 mt-4">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150 flex items-center gap-2 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          )}

          {cvUrl && (
            <a
              href={cvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={mobileMenuOpen ? 0 : -1}
              className={cn(
                'px-4 py-2 rounded text-sm font-mono',
                'border border-[var(--color-border-strong)]',
                'text-[var(--color-text-primary)]',
                'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                'transition-colors duration-150'
              )}
            >
              Download CV
            </a>
          )}
        </div>

        {/* Last focusable — close button for focus trap */}
        <button
          ref={lastFocusableRef}
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            hamburgerRef.current?.focus();
          }}
          tabIndex={mobileMenuOpen ? 0 : -1}
          className={cn(
            'mt-6 text-xs font-mono text-[var(--color-text-tertiary)]',
            'hover:text-[var(--color-text-secondary)] transition-colors duration-150',
            'focus-visible:outline-[var(--color-accent)] rounded px-2 py-1'
          )}
        >
          [ close ]
        </button>
      </div>
    </>
  );
};