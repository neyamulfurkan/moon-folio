'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { ContactMessage } from '@/types/index';

// ─── Types ───────────────────────────────────────────────────────────────────

type MessagesInboxProps = {
  initialMessages: ContactMessage[];
  archivedCount: number;
};

type MessageTableProps = {
  messages: ContactMessage[];
  expandedId: string | null;
  archivingId: string | null;
  isArchived?: boolean;
  onRowClick: (msg: ContactMessage) => void;
  onArchive: (id: string, e: React.MouseEvent) => Promise<void>;
  onMarkRead: (id: string, e: React.MouseEvent) => Promise<void>;
};

type MessageRowProps = {
  msg: ContactMessage;
  isExpanded: boolean;
  isArchiving: boolean;
  isArchived: boolean;
  onRowClick: (msg: ContactMessage) => void;
  onArchive: (id: string, e: React.MouseEvent) => Promise<void>;
  onMarkRead: (id: string, e: React.MouseEvent) => Promise<void>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const truncate = (text: string, max: number): string =>
  text.length <= max ? text : text.slice(0, max).trimEnd() + '…';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionButton({
  label,
  onClick,
  title,
  danger = false,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  danger?: boolean;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border-default)',
        borderRadius: 4,
        color: danger ? 'var(--color-danger)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        fontSize: 11,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function LabeledValue({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <span
        style={{
          color: 'var(--color-text-tertiary)',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '2px 0 0' }}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ label }: { label: string }): React.ReactElement {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 8,
        color: 'var(--color-text-tertiary)',
        fontSize: 14,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}

function MessageRow({
  msg,
  isExpanded,
  isArchiving,
  isArchived,
  onRowClick,
  onArchive,
  onMarkRead,
}: MessageRowProps): React.ReactElement {
  const isUnread = !msg.isRead;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        opacity: isArchiving ? 0.4 : 1,
        transition: 'opacity 200ms',
      }}
    >
      <div
        onClick={() => onRowClick(msg)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onRowClick(msg);
        }}
        aria-expanded={isExpanded}
        style={{
          alignItems: 'center',
          cursor: 'pointer',
          display: 'grid',
          gap: 16,
          gridTemplateColumns: '20px 160px 180px 1fr 100px 80px',
          padding: '12px 16px',
          background: isExpanded ? 'var(--color-bg-elevated)' : 'transparent',
          transition: 'background 150ms',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isUnread && (
            <span
              style={{
                background: 'var(--color-accent)',
                borderRadius: '50%',
                display: 'block',
                height: 7,
                width: 7,
                flexShrink: 0,
              }}
              aria-label="Unread"
            />
          )}
        </span>

        <span
          style={{
            color: isUnread ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: isUnread ? 600 : 400,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {msg.name}
        </span>

        <span
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {msg.email}
        </span>

        <span
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {truncate(msg.message, 80)}
        </span>

        <span
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatDate(msg.createdAt)}
        </span>

        <span style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {isUnread && !isArchived && (
            <ActionButton
              label="Mark read"
              onClick={e => void onMarkRead(msg.id, e)}
              title="Mark as read"
            />
          )}
          {!isArchived && (
            <ActionButton
              label="Archive"
              onClick={e => void onArchive(msg.id, e)}
              title="Archive message"
              danger
            />
          )}
        </span>
      </div>

      {isExpanded && (
        <div
          style={{
            background: 'var(--color-bg-tertiary)',
            borderTop: '1px solid var(--color-border-subtle)',
            padding: '16px 56px 20px',
          }}
        >
          <div style={{ marginBottom: 8, display: 'flex', gap: 24 }}>
            <LabeledValue label="From" value={`${msg.name} <${msg.email}>`} />
            <LabeledValue label="Received" value={formatDate(msg.createdAt)} />
          </div>
          <p
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {msg.message}
          </p>
          {!isArchived && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <a
                href={`mailto:${msg.email}`}
                style={{
                  background: 'var(--color-accent)',
                  borderRadius: 6,
                  color: 'var(--color-bg-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '7px 16px',
                  textDecoration: 'none',
                }}
                onClick={e => e.stopPropagation()}
              >
                Reply via email
              </a>
              <button
                onClick={e => void onArchive(msg.id, e)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 6,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '7px 16px',
                }}
              >
                Archive
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageTable({
  messages,
  expandedId,
  archivingId,
  isArchived = false,
  onRowClick,
  onArchive,
  onMarkRead,
}: MessageTableProps): React.ReactElement {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--color-border-default)',
          color: 'var(--color-text-secondary)',
          display: 'grid',
          fontSize: 11,
          fontWeight: 500,
          gridTemplateColumns: '20px 160px 180px 1fr 100px 80px',
          gap: 16,
          letterSpacing: '0.08em',
          padding: '10px 16px',
          textTransform: 'uppercase',
        }}
      >
        <span />
        <span>Name</span>
        <span>Email</span>
        <span>Preview</span>
        <span>Date</span>
        <span />
      </div>

      {messages.map(msg => (
        <MessageRow
          key={msg.id}
          msg={msg}
          isExpanded={expandedId === msg.id}
          isArchiving={archivingId === msg.id}
          isArchived={isArchived}
          onRowClick={onRowClick}
          onArchive={onArchive}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function MessagesInboxClient({
  initialMessages,
  archivedCount,
}: MessagesInboxProps): React.ReactElement {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markedReadIds, setMarkedReadIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [archivedMessages, setArchivedMessages] = useState<ContactMessage[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(
    async (id: string) => {
      if (markedReadIds.has(id)) return;
      setMarkedReadIds(prev => new Set(prev).add(id));
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, isRead: true } : m)));
      try {
        await fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isRead: true }),
        });
      } catch {
        // non-fatal — local state already updated
      }
    },
    [markedReadIds]
  );

  const handleRowClick = useCallback(
    (msg: ContactMessage) => {
      const isExpanding = expandedId !== msg.id;
      setExpandedId(isExpanding ? msg.id : null);
      if (isExpanding && !msg.isRead) {
        void markAsRead(msg.id);
      }
    },
    [expandedId, markAsRead]
  );

  const handleArchive = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setArchivingId(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      try {
        const res = await fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isArchived: true }),
        });
        if (!res.ok) throw new Error('Archive failed');
      } catch {
        setError('Failed to archive message. Please try again.');
      } finally {
        setArchivingId(null);
      }
    },
    [expandedId]
  );

  const handleManualMarkRead = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await markAsRead(id);
    },
    [markAsRead]
  );

  const handleToggleArchived = useCallback(async () => {
    if (showArchived) {
      setShowArchived(false);
      return;
    }
    setShowArchived(true);
    setLoadingArchived(true);
    try {
      const res = await fetch('/api/admin/messages?archived=true');
      if (!res.ok) throw new Error('Failed to load archived messages');
      const data = (await res.json()) as { data: ContactMessage[] };
      setArchivedMessages(data.data);
    } catch {
      setError('Failed to load archived messages.');
    } finally {
      setLoadingArchived(false);
    }
  }, [showArchived]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Messages</h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <button
          onClick={() => void handleToggleArchived()}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 8,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: 13,
            padding: '8px 16px',
          }}
        >
          {showArchived
            ? 'Hide archived'
            : `View archived${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
        </button>
      </div>

      {/* Error toast */}
      {error !== null && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid var(--color-danger)',
            borderRadius: 8,
            color: 'var(--color-danger)',
            fontSize: 13,
            marginBottom: 16,
            padding: '10px 16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Active messages */}
      {messages.length === 0 ? (
        <EmptyState label="No messages yet." />
      ) : (
        <MessageTable
          messages={messages}
          expandedId={expandedId}
          archivingId={archivingId}
          onRowClick={handleRowClick}
          onArchive={handleArchive}
          onMarkRead={handleManualMarkRead}
        />
      )}

      {/* Archived section */}
      {showArchived && (
        <>
          <div
            style={{
              borderTop: '1px solid var(--color-border-default)',
              margin: '32px 0 24px',
              paddingTop: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>
              Archived Messages
            </h2>
          </div>
          {loadingArchived ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Loading…</p>
          ) : archivedMessages.length === 0 ? (
            <EmptyState label="No archived messages." />
          ) : (
            <MessageTable
              messages={archivedMessages}
              expandedId={expandedId}
              archivingId={archivingId}
              isArchived
              onRowClick={handleRowClick}
              onArchive={() => Promise.resolve()}
              onMarkRead={handleManualMarkRead}
            />
          )}
        </>
      )}
    </div>
  );
}