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
          isScrolled ? 'header-scrolled' : '',
          'fixed top-3 left-1/2 -translate-x-1/2',
          'w-[calc(100%-24px)] max-w-5xl',
          'h-14',
          'flex items-center justify-between px-5',
          'transition-[box-shadow,background-color]',
          isReduced ? 'duration-0' : 'duration-300',
          'rounded-2xl',
          'z-[150]'
        )}
        style={{
          zIndex: 150,
          backgroundColor: 'rgba(8, 12, 22, 0.82)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: '1px solid rgba(0, 212, 255, 0.10)',
          boxShadow: [
            '0 0 0 1px rgba(0, 212, 255, 0.06)',
            '0 2px 16px rgba(0, 0, 0, 0.55)',
            '0 0 40px rgba(0, 120, 200, 0.08)',
          ].join(', '),
        } as React.CSSProperties}
      >



        {/* Cloud shimmer — lightweight CSS only, no SVG rain */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 60% 80% at 15% 50%, rgba(0, 130, 200, 0.07) 0%, transparent 70%)',
              'radial-gradient(ellipse 50% 80% at 85% 50%, rgba(0, 100, 180, 0.05) 0%, transparent 70%)',
            ].join(', '),
          }}
        />

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
          className="fixed inset-0 md:hidden"
          style={{
            zIndex: 140,
            backgroundColor: 'rgba(7, 9, 15, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
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
          'fixed md:hidden',
          'flex flex-col items-center justify-center gap-8',
          'rounded-2xl',
          'transition-[opacity,transform]',
          isReduced ? 'duration-0' : 'duration-250',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
        )}
        style={{
          zIndex: 145,
          top: '72px',
          left: '12px',
          right: '12px',
          bottom: 'auto',
          minHeight: 'min-content',
          paddingTop: '32px',
          paddingBottom: '32px',
          backgroundColor: 'rgba(10, 14, 26, 0.97)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: '1px solid rgba(0, 212, 255, 0.10)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.06)',
        }}
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