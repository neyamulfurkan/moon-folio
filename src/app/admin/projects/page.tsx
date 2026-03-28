import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { Project } from '@/types/index';
import Link from 'next/link';
import React from 'react';
import ProjectsTable from './ProjectsTable';

export const metadata: Metadata = {
  title: 'Projects | Admin',
};

export default async function AdminProjectsPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) redirect('/admin/login');

  let projects: Project[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.error('[AdminProjectsPage] Failed to fetch projects:', err);
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-mono">
            {projects.length} total · {projects.filter((p) => p.published).length} published
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg-primary)] text-sm font-medium hover:opacity-90 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
          data-cursor="pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          New Project
        </Link>
      </div>

      {/* Table */}
      <ProjectsTable initialProjects={projects} />
    </div>
  );
}