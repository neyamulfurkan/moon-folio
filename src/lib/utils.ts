import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[æÆ]/g, "ae")
    .replace(/[øØ]/g, "o")
    .replace(/[åÅ]/g, "a")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  date: Date | string,
  format: "short" | "long" | "year" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "year") {
    return d.getFullYear().toString();
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace === -1) return truncated + "…";
  return truncated.slice(0, lastSpace) + "…";
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function calculateReadTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Math.random().toString(36).slice(2, 9) +
    Math.random().toString(36).slice(2, 9)
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function angleToPoint(
  origin: { x: number; y: number },
  target: { x: number; y: number }
): number {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 5;
}