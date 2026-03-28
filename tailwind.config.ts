import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      colors: {
        accent: 'var(--color-accent)',
        'accent-dim': 'var(--color-accent-dim)',
        'accent-glow': 'var(--color-accent-glow)',
        amber: 'var(--color-amber)',
        electric: 'var(--color-electric)',
        danger: 'var(--color-danger)',
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-default': 'var(--color-border-default)',
        'border-strong': 'var(--color-border-strong)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'wire-trace': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        'led-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-12px)', opacity: '0' },
        },
        'shock-flash': {
          '0%': { opacity: '0' },
          '12%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'wire-trace': 'wire-trace 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'led-blink': 'led-blink 2s ease-in-out infinite',
        'float-up': 'float-up 0.8s ease-out forwards',
        'shock-flash': 'shock-flash 136ms ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config