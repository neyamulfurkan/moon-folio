import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ExperienceManager from './ExperienceManager';

export const metadata: Metadata = {
  title: 'Experience | Admin',
};

export default async function AdminExperiencePage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const experience = await prisma.experience.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return <ExperienceManager initialExperience={experience} />;
}