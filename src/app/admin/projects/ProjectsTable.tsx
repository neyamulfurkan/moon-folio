'use client';

import React from 'react';
import { useState, useCallback, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/index';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectsTableProps = {
  initialProjects: Project[];
};

type ConfirmDeleteState = {
  id: string;
  title: string;
} | null;

// ─── Sortable Row ──────────────────────────────────────────────────────────────

type SortableRowProps = {
  project: Project;
  onTogglePublished: (id: string, current: boolean) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDeleteRequest: (id: string, title: string) => void;
  confirmDelete: ConfirmDeleteState;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
  isTogglingId: string | null;
};

const SortableRow = ({
  project,
  onTogglePublished,
  onToggleFeatured,
  onDeleteRequest,
  confirmDelete,
  onDeleteConfirm,
  onDeleteCancel,
  isTogglingId,
}: SortableRowProps): React.ReactElement => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const isDeleting = confirmDelete?.id === project.id;
  const isToggling = isTogglingId === project.id;

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-150"
      >
        {/* Drag handle */}
        <td className="px-3 py-3 w-8">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            aria-label={`Drag to reorder ${project.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="3" r="1.2" fill="currentColor" />
              <circle cx="4" cy="7" r="1.2" fill="currentColor" />
              <circle cx="4" cy="11" r="1.2" fill="currentColor" />
              <circle cx="10" cy="3" r="1.2" fill="currentColor" />
              <circle cx="10" cy="7" r="1.2" fill="currentColor" />
              <circle cx="10" cy="11" r="1.2" fill="currentColor" />
            </svg>
          </button>
        </td>

        {/* Thumbnail */}
        <td className="px-3 py-3 w-16">
          <div className="relative w-[56px] h-[40px] rounded overflow-hidden bg-[var(--color-bg-tertiary)] flex-shrink-0">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[var(--color-text-tertiary)]"
                >
                  <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <circle cx="11" cy="5" r="1.5" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        </td>

        {/* Title + slug */}
        <td className="px-3 py-3">
          <button
            onClick={() => router.push(`/admin/projects/${project.id}`)}
            className="text-left group"
            data-cursor="pointer"
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-150 line-clamp-1">
              {project.title}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] font-mono mt-0.5">
              /{project.slug}
            </p>
          </button>
        </td>

        {/* Category */}
        <td className="px-3 py-3 hidden md:table-cell">
          <span className="inline-block px-2 py-0.5 text-xs font-mono rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] uppercase tracking-wide">
            {project.category}
          </span>
        </td>

        {/* Tech stack */}
        <td className="px-3 py-3 hidden lg:table-cell">
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="inline-block px-1.5 py-0.5 text-[11px] font-mono rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono self-center">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </td>

        {/* Published toggle */}
        <td className="px-3 py-3 text-center">
          <button
            onClick={() => onTogglePublished(project.id, project.published)}
            disabled={isToggling}
            aria-label={project.published ? 'Unpublish project' : 'Publish project'}
            aria-pressed={project.published}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-secondary)] disabled:opacity-50 ${
              project.published ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-elevated)]'
            }`}
            data-cursor="pointer"
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                project.published ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </td>

        {/* Featured toggle */}
        <td className="px-3 py-3 text-center">
          <button
            onClick={() => onToggleFeatured(project.id, project.featured)}
            disabled={isToggling}
            aria-label={project.featured ? 'Unfeature project' : 'Feature project'}
            aria-pressed={project.featured}
            className={`text-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded disabled:opacity-50 ${
              project.featured
                ? 'text-[var(--color-electric)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            }`}
            data-cursor="pointer"
          >
            {project.featured ? '★' : '☆'}
          </button>
        </td>

        {/* Sort order */}
        <td className="px-3 py-3 text-center hidden sm:table-cell">
          <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
            {project.sortOrder}
          </span>
        </td>

        {/* Actions */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2 justify-end">
            <Link
              href={`/admin/projects/${project.id}`}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150 font-mono focus:outline-none focus-visible:underline"
              data-cursor="pointer"
            >
              Edit
            </Link>
            <button
              onClick={() => onDeleteRequest(project.id, project.title)}
              className="text-xs text-[var(--color-danger)] opacity-60 hover:opacity-100 transition-opacity duration-150 font-mono focus:outline-none focus-visible:underline"
              aria-label={`Delete ${project.title}`}
              data-cursor="pointer"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>

      {/* Inline delete confirmation row */}
      {isDeleting && (
        <tr className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-default)]">
          <td colSpan={9} className="px-4 py-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-[var(--color-text-primary)]">
                Delete{' '}
                <span className="font-medium text-[var(--color-danger)]">
                  &ldquo;{confirmDelete.title}&rdquo;
                </span>
                ? This cannot be undone.
              </p>
              <button
                onClick={() => onDeleteConfirm(project.id)}
                className="text-xs font-mono px-3 py-1.5 rounded bg-[var(--color-danger)] text-white hover:opacity-90 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]"
                data-cursor="pointer"
              >
                Confirm Delete
              </button>
              <button
                onClick={onDeleteCancel}
                className="text-xs font-mono px-3 py-1.5 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                data-cursor="pointer"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── ProjectsTable (Client Component) ─────────────────────────────────────────

const ProjectsTable = ({ initialProjects }: ProjectsTableProps): React.ReactElement => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent): Promise<void> => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(projects, oldIndex, newIndex).map((p, idx) => ({
        ...p,
        sortOrder: idx,
      }));

      setProjects(reordered);
      setError(null);

      try {
        const body = reordered.map((p) => ({ id: p.id, sortOrder: p.sortOrder }));
        const res = await fetch('/api/admin/projects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to save order');
      } catch {
        setProjects(initialProjects);
        setError('Failed to save new order. Please try again.');
      }
    },
    [projects, initialProjects]
  );

  const handleTogglePublished = useCallback(
    async (id: string, current: boolean): Promise<void> => {
      setIsTogglingId(id);
      setError(null);
      const optimistic = projects.map((p) => (p.id === id ? { ...p, published: !current } : p));
      setProjects(optimistic);
      try {
        const res = await fetch(`/api/admin/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published: !current }),
        });
        if (!res.ok) throw new Error('Failed to update');
        startTransition(() => router.refresh());
      } catch {
        setProjects(projects);
        setError('Failed to update publish status.');
      } finally {
        setIsTogglingId(null);
      }
    },
    [projects, router]
  );

  const handleToggleFeatured = useCallback(
    async (id: string, current: boolean): Promise<void> => {
      setIsTogglingId(id);
      setError(null);
      const optimistic = projects.map((p) => (p.id === id ? { ...p, featured: !current } : p));
      setProjects(optimistic);
      try {
        const res = await fetch(`/api/admin/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: !current }),
        });
        if (!res.ok) throw new Error('Failed to update');
        startTransition(() => router.refresh());
      } catch {
        setProjects(projects);
        setError('Failed to update featured status.');
      } finally {
        setIsTogglingId(null);
      }
    },
    [projects, router]
  );

  const handleDeleteRequest = useCallback((id: string, title: string): void => {
    setConfirmDelete({ id, title });
  }, []);

  const handleDeleteCancel = useCallback((): void => {
    setConfirmDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const optimistic = projects.filter((p) => p.id !== id);
      setProjects(optimistic);
      setConfirmDelete(null);
      try {
        const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        startTransition(() => router.refresh());
      } catch {
        setProjects(projects);
        setError('Failed to delete project. Please try again.');
      }
    },
    [projects, router]
  );

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[var(--color-text-tertiary)]">
          <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-[var(--color-text-secondary)] text-sm">No projects yet.</p>
        <Link
          href="/admin/projects/new"
          className="text-sm font-mono text-[var(--color-accent)] hover:underline focus:outline-none focus-visible:underline"
          data-cursor="pointer"
        >
          Create your first project →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)]">
                <th className="px-3 py-2.5 w-8" aria-label="Drag handle" />
                <th className="px-3 py-2.5 w-16 text-left text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">Img</th>
                <th className="px-3 py-2.5 text-left text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">Title</th>
                <th className="px-3 py-2.5 text-left text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest hidden md:table-cell">Category</th>
                <th className="px-3 py-2.5 text-left text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest hidden lg:table-cell">Stack</th>
                <th className="px-3 py-2.5 text-center text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">Live</th>
                <th className="px-3 py-2.5 text-center text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">Featured</th>
                <th className="px-3 py-2.5 text-center text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest hidden sm:table-cell">Order</th>
                <th className="px-3 py-2.5 text-right text-xs font-mono font-medium text-[var(--color-text-tertiary)] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {projects.map((project) => (
                    <SortableRow
                      key={project.id}
                      project={project}
                      onTogglePublished={handleTogglePublished}
                      onToggleFeatured={handleToggleFeatured}
                      onDeleteRequest={handleDeleteRequest}
                      confirmDelete={confirmDelete}
                      onDeleteConfirm={handleDeleteConfirm}
                      onDeleteCancel={handleDeleteCancel}
                      isTogglingId={isTogglingId}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs font-mono text-[var(--color-text-tertiary)]">
        {projects.length} project{projects.length !== 1 ? 's' : ''} — drag rows to reorder
      </p>
    </div>
  );
};

export default ProjectsTable;