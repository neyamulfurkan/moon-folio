import type { Prisma } from '@prisma/client';

// --- Prisma model type aliases ---

export type Project = Prisma.ProjectGetPayload<Record<string, never>>;

export type Skill = Prisma.SkillGetPayload<Record<string, never>>;

export type Experience = Prisma.ExperienceGetPayload<Record<string, never>>;

export type ContactMessage = Prisma.ContactMessageGetPayload<Record<string, never>>;

// --- Derived / subset types ---

export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  thumbnailUrl: string | null;
  techStack: string[];
  featured: boolean;
  category: string;
};

export type SiteSettings = Record<string, string>;

// --- Chat types ---

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
};

// --- Hero scene types ---

export type HeroScene = {
  eyebrow: string;
  headline: string;
  supporting: string;
  accentColor: string;
};

// --- Character animation types ---

export type AnimationState =
  | 'idle'
  | 'thinking'
  | 'shocked'
  | 'relaxed'
  | 'startled'
  | 'curious'
  | 'yawn'
  | 'confused';

export type SparkPart =
  | 'HairIdle'
  | 'HairShocked'
  | 'FaceNeutral'
  | 'FaceRelaxed'
  | 'Sunglasses'
  | 'Body'
  | 'LeftArm'
  | 'RightArm'
  | 'Legs'
  | 'Stool'
  | 'DeskSetup'
  | 'PCTower'
  | 'WireAndPulse'
  | 'ThoughtBubbleCharacter'
  | 'ChatIndicator';

// --- API response wrapper ---

export type ApiResponse<T> = { data: T } | { error: string; code?: string };