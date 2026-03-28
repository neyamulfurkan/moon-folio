import type { Variants } from "framer-motion";

export type WirePulseConfig = {
  pathLength: number;
  duration: number;
  color: string;
  glowColor: string;
  size: number;
};

export const DEFAULT_WIRE_PULSE: WirePulseConfig = {
  pathLength: 200,
  duration: 1.8,
  color: "var(--color-accent)",
  glowColor: "var(--color-accent-dim)",
  size: 6,
};

export const getWirePulseVariants = (
  config?: Partial<WirePulseConfig>
): Variants => {
  const merged: WirePulseConfig = { ...DEFAULT_WIRE_PULSE, ...config };

  return {
    hidden: {
      offsetDistance: "0%",
      opacity: 0,
      scale: 0,
    },
    visible: {
      offsetDistance: ["0%", "100%"],
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      transition: {
        duration: merged.duration,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.05, 0.95, 1],
      },
    },
  };
};

/**
 * Generates an SVG cubic bezier path string simulating natural cable droop
 * between two points. Control points are offset downward from the midpoint
 * to create gravitational sag, making the wire look physically plausible.
 */
export const calculateWirePoints = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Droop amount scales with horizontal distance — longer cable sags more
  const horizontalDistance = Math.abs(endX - startX);
  const droopAmount = Math.max(12, horizontalDistance * 0.18);

  // Control points pulled toward midpoint horizontally, drooped downward
  const cp1X = startX + (midX - startX) * 0.5;
  const cp1Y = midY + droopAmount;

  const cp2X = endX - (endX - midX) * 0.5;
  const cp2Y = midY + droopAmount;

  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
};

export const PULSE_ANIMATION_PROPS = {
  animate: {
    offsetDistance: ["0%", "100%"],
    opacity: [0, 1, 1, 0],
  },
  transition: {
    duration: DEFAULT_WIRE_PULSE.duration,
    repeat: Infinity,
    ease: "linear" as const,
    times: [0, 0.05, 0.95, 1],
  },
  style: {
    width: `${DEFAULT_WIRE_PULSE.size}px`,
    height: `${DEFAULT_WIRE_PULSE.size}px`,
    borderRadius: "50%",
    backgroundColor: DEFAULT_WIRE_PULSE.color,
    boxShadow: `0 0 6px 2px ${DEFAULT_WIRE_PULSE.glowColor}`,
    position: "absolute" as const,
    offsetRotate: "0deg",
  },
} as const;