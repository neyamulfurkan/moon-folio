import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import React from 'react';
import AdminEditProjectClient from './AdminEditProjectClient';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'Edit Project | Admin' };
}

export default async function AdminEditProjectPage({ params }: PageProps): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) notFound();

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) notFound();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        minHeight: '100vh',
        color: 'var(--color-text-primary)',
      }}
    >
      <AdminEditProjectClient project={project} />
    </div>
  );
}