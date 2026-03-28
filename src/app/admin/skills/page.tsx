import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import React from 'react';
import SkillsManager from './SkillsManager';

export const metadata: Metadata = {
  title: 'Skills | Admin',
};

export default async function AdminSkillsPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Admin / Skills
          </p>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Skills
          </h1>
        </div>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {skills.length} total
        </div>
      </div>

      <SkillsManager initialSkills={skills} />
    </div>
  );
}