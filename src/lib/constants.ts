export const SITE_NAME = "Moon";

export const SITE_TAGLINE = "EEE Student & Full-Stack Developer";

export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://moon.dev";

export const SKILL_CATEGORIES = [
  "web",
  "hardware",
  "tools",
  "learning",
] as const satisfies readonly string[];

export const EXPERIENCE_TYPES = ["work", "education"] as const satisfies readonly string[];

export const PROJECT_CATEGORIES = [
  "web",
  "hardware",
  "fullstack",
] as const satisfies readonly string[];

export const MAX_CHAT_MESSAGES = 20;

export const MIN_SEND_GAP_MS = 500;

export const CHAT_MAX_TOKENS = 500;

export const CHAT_TEMPERATURE = 0.8;

export const CHAT_MODEL = "llama-3.3-70b-versatile";

export const HERO_SCENE_INTERVAL_MS = 5000;

export const SPARK_CHAT_INDICATOR_DELAY_MS = 3000;

export const SPARK_CHAT_INDICATOR_TIMEOUT_MS = 8000;

export type HeroScene = {
  eyebrow: string;
  headline: string;
  supporting: string;
  accentColor: string;
};

export const HERO_SCENES_DEFAULT: readonly HeroScene[] = [
  {
    eyebrow: "EEE Student & Full-Stack Developer",
    headline: "I build things that run on electricity.",
    supporting:
      "Web applications, embedded systems, and everything in between. If it needs power, I'm probably interested.",
    accentColor: "#00d4ff",
  },
  {
    eyebrow: "Available for freelance & internships",
    headline: "From circuits to cloud deploys.",
    supporting:
      "Hardware that talks to software. APIs that talk to microcontrollers. I like the whole stack.",
    accentColor: "#b87333",
  },
  {
    eyebrow: "Next.js · TypeScript · PostgreSQL · KiCad",
    headline: "Production code. Not just portfolio code.",
    supporting:
      "Real projects, real users, real constraints. Ask Spark about any of them.",
    accentColor: "#ffe535",
  },
] as const;