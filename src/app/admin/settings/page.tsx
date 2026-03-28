import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import React from 'react';
import SettingsForm from './SettingsForm';

export const metadata: Metadata = {
  title: 'Settings | Admin',
};

export default async function AdminSettingsPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) redirect('/admin/login');

  let settings: Record<string, string> = {};
  try {
    const rows = await prisma.siteSettings.findMany();
    for (const row of rows) {
      settings[row.key] = row.value;
    }
  } catch (err) {
    console.error('[AdminSettingsPage] Failed to fetch settings:', err);
  }

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Settings
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Manage hero scenes, social links, SEO metadata, and CV upload.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}