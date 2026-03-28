import { z } from 'zod';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date in YYYY-MM-DD format');

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  category: z.enum(['web', 'hardware', 'tools', 'learning'], {
    errorMap: () => ({ message: 'Category must be one of: web, hardware, tools, learning' }),
  }),
  proficiency: z
    .number()
    .int('Proficiency must be a whole number')
    .min(1, 'Proficiency must be at least 1')
    .max(5, 'Proficiency must be at most 5'),
  sortOrder: z
    .number()
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater'),
});

export type SkillFormData = z.infer<typeof skillSchema>;

export const experienceSchemaBase = z.object({
    type: z.enum(['work', 'education'], {
      errorMap: () => ({ message: 'Type must be either work or education' }),
    }),
    role: z
      .string()
      .trim()
      .min(2, 'Role must be at least 2 characters')
      .max(200, 'Role must be 200 characters or less'),
    organization: z
      .string()
      .trim()
      .min(2, 'Organization must be at least 2 characters')
      .max(200, 'Organization must be 200 characters or less'),
    startDate: isoDateString,
    endDate: z.string().optional(),
    isPresent: z.boolean(),
    description: z
      .array(
        z.string().trim().max(500, 'Each description item must be 500 characters or less')
      )
      .min(1, 'At least one description item is required'),
    sortOrder: z
      .number()
      .int('Sort order must be a whole number')
      .min(0, 'Sort order must be 0 or greater'),
});

export const experienceSchema = experienceSchemaBase.superRefine((data, ctx) => {
  if (!data.isPresent) {
    if (!data.endDate || data.endDate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required when this is not a current position',
        path: ['endDate'],
      });
      return;
    }
    const parsed = isoDateString.safeParse(data.endDate);
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be a valid date in YYYY-MM-DD format',
        path: ['endDate'],
      });
    }
  }
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const settingsSchema = z.object({
  hero_scene_1_eyebrow: z.string().optional(),
  hero_scene_1_headline: z.string().optional(),
  hero_scene_1_supporting: z.string().optional(),
  hero_scene_2_eyebrow: z.string().optional(),
  hero_scene_2_headline: z.string().optional(),
  hero_scene_2_supporting: z.string().optional(),
  hero_scene_3_eyebrow: z.string().optional(),
  hero_scene_3_headline: z.string().optional(),
  hero_scene_3_supporting: z.string().optional(),
  social_github: z.string().optional(),
  social_linkedin: z.string().optional(),
  social_twitter: z.string().optional(),
  social_email: z.string().optional(),
  contact_email: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_og_image_url: z.string().optional(),
  cv_url: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;