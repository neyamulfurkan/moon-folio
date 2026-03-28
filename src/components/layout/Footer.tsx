'use client';

import { SparkCharacter } from '@/components/character/SparkCharacter';
import { SITE_NAME } from '@/lib/constants';

type FooterProps = {
  socialLinks?: Record<string, string>;
};

const GitHubIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill="currentColor"
    />
  </svg>
);

const TwitterIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="currentColor"
    />
  </svg>
);

const EmailIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
      fill="currentColor"
    />
  </svg>
);

type SocialLinkItem = {
  key: string;
  label: string;
  Icon: React.FC;
  href: string;
};

const resolveSocialLinks = (
  socialLinks: Record<string, string> | undefined
): SocialLinkItem[] => {
  const items: SocialLinkItem[] = [];

  const github = socialLinks?.['social_github'];
  if (github) {
    items.push({ key: 'github', label: 'GitHub', Icon: GitHubIcon, href: github });
  }

  const linkedin = socialLinks?.['social_linkedin'];
  if (linkedin) {
    items.push({ key: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, href: linkedin });
  }

  const twitter = socialLinks?.['social_twitter'];
  if (twitter) {
    items.push({ key: 'twitter', label: 'Twitter / X', Icon: TwitterIcon, href: twitter });
  }

  const email = socialLinks?.['social_email'];
  if (email) {
    items.push({
      key: 'email',
      label: 'Email',
      Icon: EmailIcon,
      href: email.startsWith('mailto:') ? email : `mailto:${email}`,
    });
  }

  return items;
};

export const Footer: React.FC<FooterProps> = ({ socialLinks }) => {
  const links = resolveSocialLinks(socialLinks);

  return (
    <footer
      data-footer=""
      style={{
        minHeight: '300px',
        background: 'linear-gradient(180deg, #02080f 0%, #030a12 40%, #020608 100%)',
        borderTop: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '32px',
      }}
    >
      {/* Deep water background fill */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(0,20,50,0.98) 0%, rgba(2,6,14,1) 50%, #010407 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Caustic light patterns underwater */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 25% 35% at 28% 60%, rgba(0,212,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 20% 25% at 72% 55%, rgba(0,180,255,0.05) 0%, transparent 70%), radial-gradient(ellipse 35% 20% at 50% 80%, rgba(0,80,160,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Rain drops — only in top water surface area, contained to 60px — mirrors header rain */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '60px', pointerEvents: 'none', zIndex: 3 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rainDrop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,212,255,0)" />
            <stop offset="60%" stopColor="rgba(0,212,255,0.35)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0.7)" />
          </linearGradient>
        </defs>
        {[8,15,22,30,38,45,52,60,67,74,81,88,95].map((xPct, i) => (
          <line
            key={i}
            x1={`${xPct}%`} y1="-20"
            x2={`${xPct + (i % 2 === 0 ? 0.3 : -0.3)}%`} y2="100%"
            stroke="url(#rainDrop)"
            strokeWidth={0.4 + (i % 3) * 0.2}
            strokeLinecap="round"
          >
            <animate
              attributeName="opacity"
              values="0;0.6;0.8;0"
              dur={`${0.6 + (i % 7) * 0.15}s`}
              begin={`${(i * 0.19) % 1.2}s`}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 -320"
              to="0 0"
              dur={`${0.6 + (i % 7) * 0.15}s`}
              begin={`${(i * 0.19) % 1.2}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </svg>

      {/* Water surface — ripple effect at top of footer */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '80px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2040" stopOpacity="1"/>
            <stop offset="50%" stopColor="#061428" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#030810" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="surfaceSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,212,255,0)" />
            <stop offset="30%" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="50%" stopColor="rgba(0,212,255,0.15)" />
            <stop offset="70%" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0)" />
          </linearGradient>
          <filter id="ripple-blur">
            <feGaussianBlur stdDeviation="1.2"/>
          </filter>
          <filter id="drop-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        {/* Water surface base */}
        <rect x="0" y="0" width="1440" height="80" fill="url(#waterGrad)"/>
        {/* Shimmering surface highlight */}
        <rect x="0" y="0" width="1440" height="3" fill="url(#surfaceSheen)" opacity="0.8"/>
        <rect x="0" y="0" width="1440" height="1" fill="rgba(0,212,255,0.4)"/>
        {/* Animated ripple waves */}
        <g opacity="0.5">
          <ellipse cx="200" cy="8" rx="80" ry="4" fill="none" stroke="rgba(0,212,255,0.25)" strokeWidth="1" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="40" to="120" dur="2.4s" begin="0s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" begin="0s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="200" cy="8" rx="40" ry="2" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="0.8">
            <animate attributeName="rx" from="10" to="80" dur="2.4s" begin="0.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" begin="0.3s" repeatCount="indefinite"/>
          </ellipse>

          <ellipse cx="600" cy="12" rx="60" ry="3" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="30" to="110" dur="2.8s" begin="0.7s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="2.8s" begin="0.7s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="600" cy="12" rx="20" ry="2" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="0.8">
            <animate attributeName="rx" from="8" to="60" dur="2.8s" begin="1.1s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="2.8s" begin="1.1s" repeatCount="indefinite"/>
          </ellipse>

          <ellipse cx="1000" cy="6" rx="70" ry="3.5" fill="none" stroke="rgba(0,212,255,0.22)" strokeWidth="1" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="35" to="130" dur="3.2s" begin="0.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.55" to="0" dur="3.2s" begin="0.4s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="1000" cy="6" rx="20" ry="2" fill="none" stroke="rgba(0,212,255,0.38)" strokeWidth="0.8">
            <animate attributeName="rx" from="8" to="70" dur="3.2s" begin="0.9s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.65" to="0" dur="3.2s" begin="0.9s" repeatCount="indefinite"/>
          </ellipse>

          <ellipse cx="1300" cy="10" rx="50" ry="3" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="25" to="100" dur="2.6s" begin="1.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="2.6s" begin="1.3s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="1300" cy="10" rx="15" ry="1.5" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="0.8">
            <animate attributeName="rx" from="6" to="50" dur="2.6s" begin="1.7s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="2.6s" begin="1.7s" repeatCount="indefinite"/>
          </ellipse>

          <ellipse cx="820" cy="14" rx="45" ry="2.5" fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="0.8" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="20" to="90" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.45" to="0" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
          </ellipse>

          <ellipse cx="400" cy="5" rx="55" ry="3" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8" filter="url(#ripple-blur)">
            <animate attributeName="rx" from="28" to="100" dur="3.0s" begin="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="3.0s" begin="1.8s" repeatCount="indefinite"/>
          </ellipse>
        </g>

        {/* Rain splat drops hitting water surface */}
        {[120,320,520,720,920,1120,1320,220,440,680,880,1080,1240].map((x, i) => (
          <g key={i}>
            {/* Tiny vertical drop impact */}
            <line
              x1={x} y1={2 + (i % 3) * 4}
              x2={x} y2={8 + (i % 3) * 4}
              stroke="rgba(0,212,255,0.5)"
              strokeWidth="0.6"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur={`${1.2 + (i % 5) * 0.3}s`}
                begin={`${(i * 0.23) % 2.5}s`}
                repeatCount="indefinite"
              />
            </line>
            {/* Tiny horizontal splash */}
            <line
              x1={x - 4} y1={8 + (i % 3) * 4}
              x2={x + 4} y2={8 + (i % 3) * 4}
              stroke="rgba(0,212,255,0.35)"
              strokeWidth="0.5"
              strokeLinecap="round"
            >
              <animate
                attributeName="opacity"
                values="0;0.4;0"
                dur={`${1.2 + (i % 5) * 0.3}s`}
                begin={`${(i * 0.23 + 0.1) % 2.5}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}

        {/* Secondary shimmer lines */}
        <path d="M0 6 Q360 10 720 6 Q1080 2 1440 6" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="1">
          <animate attributeName="d" values="M0 6 Q360 10 720 6 Q1080 2 1440 6;M0 4 Q360 8 720 4 Q1080 0 1440 4;M0 6 Q360 10 720 6 Q1080 2 1440 6" dur="4s" repeatCount="indefinite"/>
        </path>
        <path d="M0 14 Q480 18 960 14 Q1200 12 1440 16" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="1">
          <animate attributeName="d" values="M0 14 Q480 18 960 14 Q1200 12 1440 16;M0 16 Q480 12 960 16 Q1200 18 1440 14;M0 14 Q480 18 960 14 Q1200 12 1440 16" dur="5s" repeatCount="indefinite"/>
        </path>
      </svg>

      {/* Water glow where Spark lands in footer */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '6%',
        width: '280px',
        height: '60px',
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,212,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(14px)',
        zIndex: 3,
      }} />

      {/* Social links + copyright — bottom center */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {links.length > 0 && (
          <nav aria-label="Social links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {links.map(({ key, label, Icon, href }) => (
              <a
                key={key}
                href={href}
                target={key !== 'email' ? '_blank' : undefined}
                rel={key !== 'email' ? 'noopener noreferrer' : undefined}
                aria-label={label}
                data-cursor="pointer"
                style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 150ms ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)'; }}
              >
                <Icon />
              </a>
            ))}
          </nav>
        )}
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', fontFamily: 'var(--font-display)', lineHeight: 1.5, margin: 0 }}>
          © {new Date().getFullYear()} {SITE_NAME}. Built with ⚡ and TypeScript.
        </p>
      </div>
    </footer>
  );
};