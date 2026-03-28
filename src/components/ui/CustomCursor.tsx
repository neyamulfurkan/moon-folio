'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type WaterDrop = {
  x: number;
  y: number;
  opacity: number;
  size: number;
  vy: number;
};

type Ripple = {
  x: number;
  y: number;
  r: number;
  maxR: number;
  opacity: number;
};

export const CustomCursor: React.FC = () => {
  const isReduced   = useReducedMotion();
  const cursorRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const dropsRef    = useRef<WaterDrop[]>([]);
  const ripplesRef  = useRef<Ripple[]>([]);
  const prevRef     = useRef({ x: -999, y: -999 });
  const rafRef      = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) return;

    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    if (!cursor || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = (): void => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Effects loop (canvas only — cursor div never touched here) ───────────
    const loop = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // water drops
      for (let i = dropsRef.current.length - 1; i >= 0; i--) {
        const d = dropsRef.current[i]!;
        d.y       += d.vy;
        d.opacity -= 0.03;
        if (d.opacity <= 0) { dropsRef.current.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = d.opacity;
        ctx.fillStyle   = '#7ec8e3';
        // circle body
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        // tiny tail
        ctx.beginPath();
        ctx.moveTo(d.x - d.size * 0.35, d.y + d.size * 0.5);
        ctx.lineTo(d.x, d.y + d.size * 2);
        ctx.lineTo(d.x + d.size * 0.35, d.y + d.size * 0.5);
        ctx.fill();
        ctx.restore();
      }

      // ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rp = ripplesRef.current[i]!;
        rp.r       += 1.8;
        rp.opacity -= 0.025;
        if (rp.opacity <= 0 || rp.r >= rp.maxR) { ripplesRef.current.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = rp.opacity;
        ctx.strokeStyle = '#a8d8ea';
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // ── Mouse move — cursor at NATIVE speed, no rAF, no lerp ────────────────
    const onMouseMove = (e: MouseEvent): void => {
      // move cursor div synchronously — zero delay
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursor.style.opacity   = '1';

      // spawn drop only if moved enough
      const dx = e.clientX - prevRef.current.x;
      const dy = e.clientY - prevRef.current.y;
      if (dx * dx + dy * dy > 12) {
        dropsRef.current.push({
          x:       e.clientX + (Math.random() - 0.5) * 5,
          y:       e.clientY + (Math.random() - 0.5) * 5,
          opacity: 0.5 + Math.random() * 0.25,
          size:    1 + Math.random() * 1.5,
          vy:      0.5 + Math.random() * 0.7,
        });
        if (dropsRef.current.length > 35) dropsRef.current.shift();
        prevRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseLeave = (): void => { cursor.style.opacity = '0'; };
    const onMouseEnter = (): void => { cursor.style.opacity = '1'; };

    const onClick = (e: MouseEvent): void => {
      for (let i = 0; i < 3; i++) {
        ripplesRef.current.push({
          x: e.clientX, y: e.clientY,
          r: i * 3, maxR: 20 + i * 12,
          opacity: 0.7 - i * 0.15,
        });
      }
    };

    const onPointerOver = (e: Event): void => {
      if ((e.target as HTMLElement | null)?.closest('[data-cursor="pointer"]'))
        cursor.setAttribute('data-hovered', '');
    };
    const onPointerOut = (e: Event): void => {
      if ((e.target as HTMLElement | null)?.closest('[data-cursor="pointer"]'))
        cursor.removeAttribute('data-hovered');
    };

    document.addEventListener('mousemove',   onMouseMove);
    document.addEventListener('mouseleave',  onMouseLeave);
    document.addEventListener('mouseenter',  onMouseEnter);
    document.addEventListener('click',       onClick);
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout',  onPointerOut);

    return () => {
      document.removeEventListener('mousemove',   onMouseMove);
      document.removeEventListener('mouseleave',  onMouseLeave);
      document.removeEventListener('mouseenter',  onMouseEnter);
      document.removeEventListener('click',       onClick);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout',  onPointerOut);
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (isReduced) return null;

  return (
    <>
      {/* Effects canvas — water trail and click ripples */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99997,
          mixBlendMode: 'screen',
        }}
      />

      {/* Cursor div — EXACTLY original crosshair, zero transition */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-200px, -200px)',
          opacity: 0,
        }}
      >
        {/* Default: original crosshair test probe — unchanged */}
        <svg
          width="20"
          height="20"
          viewBox="-10 -10 20 20"
          style={{ position: 'absolute', top: '-10px', left: '-10px' }}
          className="cursor-default-shape"
        >
          <line x1="-8" y1="0" x2="8" y2="0"
            stroke="var(--color-text-secondary)" strokeWidth="1" strokeLinecap="round" />
          <line x1="0" y1="-8" x2="0" y2="8"
            stroke="var(--color-text-secondary)" strokeWidth="1" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2" fill="var(--color-accent)" />
        </svg>

        {/* Hover: original lightning bolt — unchanged */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          style={{ position: 'absolute', top: '-9px', left: '-9px', display: 'none' }}
          className="cursor-hover-shape"
        >
          <polygon points="10,1 4,10 8,10 8,17 14,8 10,8" fill="#ffe535" />
        </svg>

        <style>{`
          div[data-hovered] .cursor-default-shape { display: none !important; }
          div[data-hovered] .cursor-hover-shape   { display: block !important; }
        `}</style>
      </div>
    </>
  );
};