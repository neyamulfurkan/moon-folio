import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ContactMessage } from '@prisma/client';

const AdminDashboardPage = async (): Promise<React.ReactElement> => {
  const session = await auth();
  if (!session) {
    redirect('/admin/login');
  }

  const [
    totalProjects,
    publishedProjects,
    totalSkills,
    unreadMessages,
    recentMessages,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.skill.count(),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const statCards: Array<{ label: string; value: number; href: string; accent?: boolean }> = [
    { label: 'Total Projects', value: totalProjects, href: '/admin/projects' },
    { label: 'Published', value: publishedProjects, href: '/admin/projects' },
    { label: 'Skills', value: totalSkills, href: '/admin/skills' },
    { label: 'Unread Messages', value: unreadMessages, href: '/admin/messages', accent: unreadMessages > 0 },
  ];

  const quickLinks: Array<{ label: string; href: string; description: string }> = [
    { label: 'Projects', href: '/admin/projects', description: 'Manage portfolio projects' },
    { label: 'Skills', href: '/admin/skills', description: 'Update skill proficiencies' },
    { label: 'Experience', href: '/admin/experience', description: 'Edit work and education history' },
    { label: 'Messages', href: '/admin/messages', description: 'Read contact form submissions' },
    { label: 'Settings', href: '/admin/settings', description: 'Update hero scenes, social links, CV' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Overview of your portfolio content
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href as '/admin/projects' | '/admin/skills' | '/admin/messages'}
            style={{
              display: 'block',
              padding: '24px',
              background: 'var(--color-bg-secondary)',
              border: `1px solid ${card.accent ? 'var(--color-accent)' : 'var(--color-border-default)'}`,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'border-color 150ms',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: card.accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
                lineHeight: 1.1,
                marginBottom: '8px',
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {card.label}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Recent Messages */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Recent Messages
            </h2>
            <Link
              href="/admin/messages"
              style={{
                fontSize: '12px',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
            >
              View all →
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div
              style={{
                padding: '24px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-text-tertiary)',
                textAlign: 'center',
              }}
            >
              No messages yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentMessages.map((msg: ContactMessage) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  style={{
                    display: 'block',
                    padding: '16px',
                    background: 'var(--color-bg-secondary)',
                    border: `1px solid ${!msg.isRead ? 'var(--color-border-strong)' : 'var(--color-border-default)'}`,
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!msg.isRead && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: msg.isRead ? 400 : 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {msg.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        {msg.email}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginLeft: msg.isRead ? 0 : '14px',
                    }}
                  >
                    {msg.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Quick Links
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as '/admin/projects' | '/admin/skills' | '/admin/experience' | '/admin/messages' | '/admin/settings'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {link.description}
                  </div>
                </div>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '16px' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;