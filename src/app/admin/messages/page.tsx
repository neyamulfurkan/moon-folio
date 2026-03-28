import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MessagesInboxClient from './MessagesInboxClient';

export const metadata = { title: 'Messages | Admin' };

export default async function AdminMessagesPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const [messages, archivedCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.count({ where: { isArchived: true } }),
  ]);

  return <MessagesInboxClient initialMessages={messages} archivedCount={archivedCount} />;
}