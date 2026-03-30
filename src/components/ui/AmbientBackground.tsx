'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Types ───────────────────────────────────────────────────────────────────

type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
};



type FlyingObject = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  type: 'plane' | 'bird1' | 'bird2';
  scale: number;
  life: number;
  maxLife: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const RAIN_COUNT_DESKTOP = 80;
const RAIN_COUNT_MOBILE = 30;
const MAX_FLYING_OBJECTS = 4;
const FLYING_SPAWN_INTERVAL = 4000;
const MAX_PLANES = 1; // only 1 plane at a time ever

// ─── AmbientBackground ───────────────────────────────────────────────────────

export const AmbientBackground: React.FC = () => {
  const isReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const rainRef = useRef<RainDrop[]>([]);
  const isMobileRef = useRef<boolean>(false);
  const flyingRef = useRef<FlyingObject[]>([]);
  const lastFlyingSpawnRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const rainCountRef = useRef<number>(RAIN_COUNT_DESKTOP);

  // ── Initialise rain drops ──────────────────────────────────────────────────
  const initRain = useCallback((w: number, h: number): void => {
    rainRef.current = Array.from({ length: rainCountRef.current }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      length: 8 + Math.random() * 14,
      speed: 3.5 + Math.random() * 4,
      opacity: 0.06 + Math.random() * 0.08,
      width: 0.4 + Math.random() * 0.5,
    }));
  }, []);

  

  // ── Spawn a flying object ──────────────────────────────────────────────────
  const spawnFlyingObject = useCallback((w: number, h: number): void => {
    if (flyingRef.current.length >= MAX_FLYING_OBJECTS) return;

    const planeCount = flyingRef.current.filter(o => o.type === 'plane').length;
    const roll = Math.random();
    const type: FlyingObject['type'] = (planeCount < MAX_PLANES && roll < 0.15)
      ? 'plane'
      : roll < 0.57 ? 'bird1' : 'bird2';
    const maxLife = 420 + Math.random() * 300;

    flyingRef.current.push({
      x: -80,
      y: 60 + Math.random() * (h * 0.5),
      vx: type === 'plane' ? 1.4 + Math.random() * 0.8 : 0.6 + Math.random() * 0.5,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: type === 'plane' ? 0.25 + Math.random() * 0.15 : 0.2 + Math.random() * 0.15,
      type,
      scale: type === 'plane' ? 0.6 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
      life: 0,
      maxLife,
    });
  }, []);

  // ── Draw a tiny plane silhouette ──────────────────────────────────────────
  const drawPlane = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number): void => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#a0c4ff';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Fuselage
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();

      // Nose cone
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(28, -2);
      ctx.lineTo(22, 0);
      ctx.stroke();

      // Main wings
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(-6, -12);
      ctx.lineTo(-14, -13);
      ctx.lineTo(-8, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-14, 13);
      ctx.lineTo(-8, 0);
      ctx.stroke();

      // Tail fins
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-22, -6);
      ctx.lineTo(-16, 0);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // ── Draw a tiny bird silhouette (wing up) ─────────────────────────────────
  const drawBird1 = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number): void => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#b8d8f0';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Left wing up
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8, -6, -16, -2);
      ctx.stroke();

      // Right wing up
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, -6, 16, -2);
      ctx.stroke();

      // Body hint
      ctx.beginPath();
      ctx.moveTo(-2, 1);
      ctx.lineTo(4, 0);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // ── Draw a tiny bird silhouette (wing mid) ────────────────────────────────
  const drawBird2 = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number): void => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#b8d8f0';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Wings flat/slightly down
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.quadraticCurveTo(-8, 0, 0, 0);
      ctx.quadraticCurveTo(8, 0, 16, 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(-2, 1);
      ctx.lineTo(4, 0);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // ── Main render loop ──────────────────────────────────────────────────────
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, now: number): void => {
      ctx.clearRect(0, 0, w, h);
      frameRef.current += 1;

      // ── Rain ──────────────────────────────────────────────────────────────
      for (const drop of rainRef.current) {
        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = '#a8d4f0';
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Slight diagonal — wind-driven
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.length * 0.18, drop.y + drop.length);
        ctx.stroke();
        ctx.restore();

        // Move
        drop.y += drop.speed;
        drop.x -= drop.speed * 0.18;

        // Reset when off screen
        if (drop.y > h + 20) {
          drop.y = -20;
          drop.x = Math.random() * w;
        }
        if (drop.x < -10) {
          drop.x = w + 10;
        }
      }



      // ── Flying objects ────────────────────────────────────────────────────
      // Spawn check
      if (now - lastFlyingSpawnRef.current > FLYING_SPAWN_INTERVAL) {
        spawnFlyingObject(w, h);
        lastFlyingSpawnRef.current = now;
      }

      flyingRef.current = flyingRef.current.filter((obj) => {
        const lifeFrac = obj.life / obj.maxLife;
        const fadedOpacity = obj.opacity * Math.sin(lifeFrac * Math.PI);

        if (obj.type === 'plane') {
          drawPlane(ctx, obj.x, obj.y, obj.scale, fadedOpacity);
        } else if (obj.type === 'bird1') {
          // Alternate wing positions based on frame for flapping illusion
          const wingFrame = Math.floor(obj.life / 18) % 2 === 0;
          if (wingFrame) {
            drawBird1(ctx, obj.x, obj.y, obj.scale, fadedOpacity);
          } else {
            drawBird2(ctx, obj.x, obj.y, obj.scale, fadedOpacity);
          }
        } else {
          const wingFrame = Math.floor(obj.life / 22) % 2 === 0;
          if (wingFrame) {
            drawBird2(ctx, obj.x, obj.y, obj.scale, fadedOpacity);
          } else {
            drawBird1(ctx, obj.x, obj.y, obj.scale, fadedOpacity);
          }
        }

        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.life += 1;

        // Keep if still alive and on screen
        return obj.life < obj.maxLife && obj.x < w + 100;
      });
    },
    [drawPlane, drawBird1, drawBird2, spawnFlyingObject]
  );

  // ── Setup & animation loop ────────────────────────────────────────────────
  useEffect(() => {
    if (isReduced) return;

    // Detect mobile after mount — safe, window is guaranteed here
    isMobileRef.current = window.innerWidth <= 768;
    rainCountRef.current = isMobileRef.current ? RAIN_COUNT_MOBILE : RAIN_COUNT_DESKTOP;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initRain(canvas.width, canvas.height);
    };

    setSize();

    const handleResize = (): void => setSize();
    window.addEventListener('resize', handleResize, { passive: true });

    const loop = (now: number): void => {
      if (!canvas) return;
      render(ctx, canvas.width, canvas.height, now);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReduced, initRain, render]);

  if (isReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  );
};