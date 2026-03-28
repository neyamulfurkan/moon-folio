import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/lib/constants";

export const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  shortDesc: z.string().max(160, "Short description must be at most 160 characters"),
  fullDesc: z.string().max(50000, "Full description must be at most 50000 characters"),
  techStack: z
    .array(z.string().max(50, "Each tech stack item must be at most 50 characters"))
    .min(1, "At least one tech stack item is required"),
  category: z.enum(PROJECT_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Category must be one of: web, hardware, fullstack" }),
  }),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be at least 0"),
  thumbnailUrl: z.union([z.string().url("Thumbnail URL must be a valid URL"), z.literal("")]).optional(),
  galleryUrls: z
    .array(z.union([z.string().url("Each gallery URL must be a valid URL"), z.literal("")]))
    .max(8, "Gallery can contain at most 8 images")
    .optional(),
  liveUrl: z.union([z.string().url("Live URL must be a valid URL"), z.literal("")]).optional(),
  githubUrl: z.union([z.string().url("GitHub URL must be a valid URL"), z.literal("")]).optional(),
  challenge: z.string().max(5000, "Challenge must be at most 5000 characters").optional(),
  solution: z.string().max(5000, "Solution must be at most 5000 characters").optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const projectUpdateSchema = projectSchema.partial();

export type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;