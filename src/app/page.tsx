import { HeroSection } from '@/components/sections/HeroSection';
// FloatingSparkIsland moved to layout.tsx
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import { HERO_SCENES_DEFAULT } from '@/lib/constants';
import type { HeroScene, ProjectSummary, Skill, Experience } from '@/types/index';

export const revalidate = 3600;

const HERO_SCENE_KEYS = [
  'hero_scene_1_eyebrow',
  'hero_scene_1_headline',
  'hero_scene_1_supporting',
  'hero_scene_1_accent_color',
  'hero_scene_2_eyebrow',
  'hero_scene_2_headline',
  'hero_scene_2_supporting',
  'hero_scene_2_accent_color',
  'hero_scene_3_eyebrow',
  'hero_scene_3_headline',
  'hero_scene_3_supporting',
  'hero_scene_3_accent_color',
] as const;

const SOCIAL_KEYS = [
  'social_github',
  'social_linkedin',
  'social_twitter',
  'social_email',
  'cv_url',
] as const;

function assembleHeroScenes(
  settings: { key: string; value: string }[]
): HeroScene[] {
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const scenes: HeroScene[] = [];

  for (let i = 1; i <= 3; i++) {
    const eyebrow = map.get(`hero_scene_${i}_eyebrow`);
    const headline = map.get(`hero_scene_${i}_headline`);
    const supporting = map.get(`hero_scene_${i}_supporting`);
    const accentColor = map.get(`hero_scene_${i}_accent_color`);

    if (eyebrow && headline && supporting) {
      scenes.push({
        eyebrow,
        headline,
        supporting,
        accentColor: accentColor ?? '#00d4ff',
      });
    }
  }

  return scenes;
}

export default async function Home(): Promise<React.ReactElement> {
  let projects: ProjectSummary[] = [];
  let skills: Skill[] = [];
  let experience: Experience[] = [];
  let heroScenes: HeroScene[] = [];
  let socialLinks: Record<string, string> = {};
  let cvUrl = '';

  try {
    const [
      rawProjects,
      rawSkills,
      rawExperience,
      heroSettings,
      socialSettings,
    ] = await Promise.all([
      prisma.project.findMany({
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDesc: true,
          thumbnailUrl: true,
          techStack: true,
          featured: true,
          category: true,
        },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      }),
      prisma.skill.findMany({
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.experience.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.siteSettings.findMany({
        where: { key: { in: [...HERO_SCENE_KEYS] } },
      }),
      prisma.siteSettings.findMany({
        where: { key: { in: [...SOCIAL_KEYS] } },
      }),
    ]);

    projects = rawProjects;
    skills = rawSkills as Skill[];
    experience = rawExperience as Experience[];
    heroScenes = assembleHeroScenes(heroSettings);

    const socialMap: Record<string, string> = {};
    for (const setting of socialSettings) {
      if (setting.value) {
        socialMap[setting.key] = setting.value;
      }
    }
    cvUrl = socialMap['cv_url'] ?? '';
    delete socialMap['cv_url'];
    socialLinks = socialMap;
  } catch (err) {
    console.error('[page.tsx] Database fetch failed — rendering with defaults:', err);
  }

  const effectiveHeroScenes =
    heroScenes.length > 0 ? heroScenes : [...HERO_SCENES_DEFAULT];

  const hardwareCount = projects.filter((p) => p.category === 'hardware').length;

  return (
    <main id="main">
      <HeroSection scenes={effectiveHeroScenes} cvUrl={cvUrl} />
      <AboutSection stats={{ projects: projects.length, years: 3, hardwareProjects: hardwareCount }} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ExperienceSection experience={experience} />
      <ContactSection />
      <div style={{ position: 'relative', zIndex: 70 }}>
        <Footer socialLinks={socialLinks} />
      </div>
    </main>
  );
}