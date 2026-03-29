import { HeroSection } from '@/components/sections/HeroSection';
import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/sections/AboutSection').then(m => ({ default: m.AboutSection })), { ssr: false });
const SkillsSection = dynamic(() => import('@/components/sections/SkillsSection').then(m => ({ default: m.SkillsSection })), { ssr: false });
const ProjectsSectionWrapper = dynamic(() => import('@/components/sections/ProjectsSectionWrapper').then(m => ({ default: m.ProjectsSectionWrapper })), { ssr: false });
const ExperienceSection = dynamic(() => import('@/components/sections/ExperienceSection').then(m => ({ default: m.ExperienceSection })), { ssr: false });
const ContactSection = dynamic(() => import('@/components/sections/ContactSection').then(m => ({ default: m.ContactSection })), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), { ssr: false });
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
  'profile_photo_url',
  'availability_status',
  'availability_label',
  'testimonial_1_name',
  'testimonial_1_role',
  'testimonial_1_text',
  'testimonial_2_name',
  'testimonial_2_role',
  'testimonial_2_text',
  'testimonial_3_name',
  'testimonial_3_role',
  'testimonial_3_text',
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
  let profilePhotoUrl = '';
  let availabilityStatus = 'open';
  let availabilityLabel = 'Available for freelance & internships';
  type Testimonial = { name: string; role: string; text: string };
  const testimonials: Testimonial[] = [];

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
    profilePhotoUrl = socialMap['profile_photo_url'] ?? '';
    availabilityStatus = socialMap['availability_status'] ?? 'open';
    availabilityLabel = socialMap['availability_label'] ?? 'Available for freelance & internships';

    for (let i = 1; i <= 3; i++) {
      const name = socialMap[`testimonial_${i}_name`] ?? '';
      const role = socialMap[`testimonial_${i}_role`] ?? '';
      const text = socialMap[`testimonial_${i}_text`] ?? '';
      if (name && text) {
        testimonials.push({ name, role, text });
      }
    }

    delete socialMap['cv_url'];
    delete socialMap['profile_photo_url'];
    delete socialMap['availability_status'];
    delete socialMap['availability_label'];
    for (let i = 1; i <= 3; i++) {
      delete socialMap[`testimonial_${i}_name`];
      delete socialMap[`testimonial_${i}_role`];
      delete socialMap[`testimonial_${i}_text`];
    }
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
      <AboutSection
        stats={{ projects: projects.length, years: 3, hardwareProjects: hardwareCount }}
        profilePhotoUrl={profilePhotoUrl}
        availabilityStatus={availabilityStatus}
        availabilityLabel={availabilityLabel}
        testimonials={testimonials}
      />
      <SkillsSection skills={skills} />
       <ProjectsSectionWrapper projects={projects} />
      <ExperienceSection experience={experience} />
      <ContactSection />
      <div style={{ position: 'relative', zIndex: 70 }}>
        <Footer socialLinks={socialLinks} />
      </div>
    </main>
  );
}