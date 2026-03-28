import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ── Site Settings ──────────────────────────────────────────────────────────

  const settings: Array<{ key: string; value: string }> = [
    // Hero Scene 1
    { key: 'hero_scene_1_eyebrow', value: 'EEE Student & Full-Stack Developer' },
    { key: 'hero_scene_1_headline', value: 'I build things that run on electricity.' },
    {
      key: 'hero_scene_1_supporting',
      value:
        'Web applications, embedded systems, and everything in between. If it needs power, I\'m probably interested.',
    },
    { key: 'hero_scene_1_accentColor', value: '#00d4ff' },

    // Hero Scene 2
    { key: 'hero_scene_2_eyebrow', value: 'Available for freelance & internships' },
    { key: 'hero_scene_2_headline', value: 'From circuits to cloud deploys.' },
    {
      key: 'hero_scene_2_supporting',
      value:
        'Hardware that talks to software. APIs that talk to microcontrollers. I like the whole stack.',
    },
    { key: 'hero_scene_2_accentColor', value: '#b87333' },

    // Hero Scene 3
    { key: 'hero_scene_3_eyebrow', value: 'Next.js · TypeScript · PostgreSQL · KiCad' },
    { key: 'hero_scene_3_headline', value: 'Production code. Not just portfolio code.' },
    {
      key: 'hero_scene_3_supporting',
      value:
        'Real projects, real users, real constraints. Ask Spark about any of them.',
    },
    { key: 'hero_scene_3_accentColor', value: '#ffe535' },

    // Social links
    { key: 'social_github', value: '' },
    { key: 'social_linkedin', value: '' },
    { key: 'social_twitter', value: '' },
    { key: 'social_email', value: '' },

    // Contact
    { key: 'contact_email', value: '' },

    // SEO
    { key: 'seo_title', value: 'Moon — Developer Portfolio' },
    {
      key: 'seo_description',
      value: 'Electrical and Electronics Engineering student and full-stack web developer.',
    },
    { key: 'seo_og_image_url', value: '' },

    // CV
    { key: 'cv_url', value: '' },
  ];

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      create: { key: setting.key, value: setting.value },
      update: { value: setting.value },
    });
  }

  console.log(`✓ Seeded ${settings.length} site settings`);

  // ── Skills ─────────────────────────────────────────────────────────────────

  type SkillSeed = {
    name: string;
    category: string;
    proficiency: number;
    sortOrder: number;
  };

  const skills: SkillSeed[] = [
    // Web
    { name: 'Next.js', category: 'web', proficiency: 5, sortOrder: 0 },
    { name: 'TypeScript', category: 'web', proficiency: 4, sortOrder: 1 },
    { name: 'Tailwind CSS', category: 'web', proficiency: 4, sortOrder: 2 },

    // Hardware
    { name: 'PCB Design', category: 'hardware', proficiency: 3, sortOrder: 0 },
    { name: 'Arduino', category: 'hardware', proficiency: 4, sortOrder: 1 },

    // Tools
    { name: 'Git', category: 'tools', proficiency: 5, sortOrder: 0 },
    { name: 'Figma', category: 'tools', proficiency: 3, sortOrder: 1 },

    // Learning
    { name: 'Rust', category: 'learning', proficiency: 2, sortOrder: 0 },
  ];

  let skillCount = 0;
  for (const skill of skills) {
    // Use findFirst + upsert-style create/update via deleteMany+create would duplicate;
    // instead use createMany with skipDuplicates on the composite (name, category) pair
    // but Prisma doesn't support composite unique on non-unique fields.
    // Fall back to find-then-create pattern.
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name, category: skill.category },
    });

    if (existing) {
      await prisma.skill.update({
        where: { id: existing.id },
        data: {
          proficiency: skill.proficiency,
          sortOrder: skill.sortOrder,
        },
      });
    } else {
      await prisma.skill.create({ data: skill });
      skillCount++;
    }
  }

  console.log(`✓ Seeded ${skills.length} skills (${skillCount} new)`);

  // ── Experience ─────────────────────────────────────────────────────────────

  type ExperienceSeed = {
    type: string;
    role: string;
    organization: string;
    startDate: Date;
    endDate?: Date;
    isPresent: boolean;
    description: string[];
    sortOrder: number;
  };

  const experiences: ExperienceSeed[] = [
    {
      type: 'work',
      role: 'Web Developer',
      organization: 'Freelance',
      startDate: new Date('2022-01-01'),
      isPresent: true,
      description: [
        'Built production web applications for clients',
        'Focused on Next.js and TypeScript',
      ],
      sortOrder: 0,
    },
    {
      type: 'education',
      role: 'B.Sc. Electrical and Electronics Engineering',
      organization: '[University Name]',
      startDate: new Date('2021-01-01'),
      isPresent: true,
      description: [
        'Studying circuit design, signal processing, and embedded systems',
      ],
      sortOrder: 0,
    },
  ];

  let expCount = 0;
  for (const exp of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { role: exp.role, organization: exp.organization, type: exp.type },
    });

    if (existing) {
      await prisma.experience.update({
        where: { id: existing.id },
        data: {
          startDate: exp.startDate,
          isPresent: exp.isPresent,
          description: exp.description,
          sortOrder: exp.sortOrder,
        },
      });
    } else {
      await prisma.experience.create({ data: exp });
      expCount++;
    }
  }

  console.log(`✓ Seeded ${experiences.length} experience entries (${expCount} new)`);

  // ── Sample Project ─────────────────────────────────────────────────────────

  await prisma.project.upsert({
    where: { slug: 'portfolio-website' },
    create: {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      shortDesc: 'This portfolio — built with Next.js, TypeScript, and Spark the AI character.',
      fullDesc:
        '<p>A living, breathing developer portfolio featuring Spark, a hand-drawn SVG character powered by a Groq LLM. Built with Next.js 14 App Router, TypeScript strict mode, Framer Motion, and a Neon PostgreSQL database.</p>',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Groq'],
      category: 'web',
      featured: true,
      published: true,
      sortOrder: 0,
      thumbnailUrl: null,
      galleryUrls: [],
      liveUrl: null,
      githubUrl: null,
      challenge:
        'Building an animated SVG character entirely in TypeScript without any image assets, while maintaining 60fps animations and accessibility.',
      solution:
        'Used Framer Motion with compositor-only transforms, hand-crafted bezier paths in SparkParts.tsx, and a custom animation state machine in useSparkAnimation.',
    },
    update: {
      title: 'Portfolio Website',
      shortDesc: 'This portfolio — built with Next.js, TypeScript, and Spark the AI character.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Groq'],
      category: 'web',
      featured: true,
      published: true,
    },
  });

  console.log('✓ Seeded 1 sample project');
  console.log('\n✅ Seed complete');
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });