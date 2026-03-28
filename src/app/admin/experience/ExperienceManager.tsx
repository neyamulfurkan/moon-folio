'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import type { Experience } from '@/types/index';
import { experienceSchema, type ExperienceFormData } from '@/validations/admin';
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
import React from 'react';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  type: 'work' | 'education';
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  description: string[];
  sortOrder: number;
};

type FormErrors = Partial<Record<keyof ExperienceFormData | 'root', string>>;

type EditingEntry = { id: string; data: FormState } | null;

const emptyForm = (type: 'work' | 'education', sortOrder: number): FormState => ({
  type,
  role: '',
  organization: '',
  startDate: '',
  endDate: '',
  isPresent: false,
  description: [''],
  sortOrder,
});

// ─── Sortable Row ─────────────────────────────────────────────────────────────

function SortableExperienceRow({
  entry,
  onEdit,
  onDelete,
  isDeleting,
}: {
  entry: Experience;
  onEdit: (entry: Experience) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const startDateStr = entry.startDate ? formatDate(entry.startDate, 'short') : '—';
  const endDateStr = entry.isPresent
    ? 'Present'
    : entry.endDate
    ? formatDate(entry.endDate, 'short')
    : '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-[var(--color-border-default)] rounded bg-[var(--color-bg-secondary)] p-4 mb-2 group"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-1 cursor-grab active:cursor-grabbing text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="4" r="1.5" fill="currentColor" />
            <circle cx="11" cy="4" r="1.5" fill="currentColor" />
            <circle cx="5" cy="8" r="1.5" fill="currentColor" />
            <circle cx="11" cy="8" r="1.5" fill="currentColor" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="11" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono text-[var(--color-text-tertiary)] uppercase tracking-widest">
              {entry.type === 'work' ? 'IC' : 'EDU'}-
              {String(entry.sortOrder + 1).padStart(2, '0')}
            </span>
          </div>
          <p className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight truncate">
            {entry.role}
          </p>
          <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 truncate">
            {entry.organization}
          </p>
          <p className="text-[var(--color-text-tertiary)] text-xs font-mono mt-1">
            {startDateStr} — {endDateStr}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {confirmDelete ? (
            <>
              <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
              <button
                onClick={() => onDelete(entry.id)}
                disabled={isDeleting}
                className="text-xs px-2 py-1 rounded bg-[var(--color-danger)] text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(entry)}
                className="text-xs px-2 py-1 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs px-2 py-1 rounded border border-[var(--color-border-default)] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

function EntryForm({
  form,
  errors,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit,
}: {
  form: FormState;
  errors: FormErrors;
  onChange: (updates: Partial<FormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  const updateDescription = (index: number, value: string) => {
    const next = [...form.description];
    next[index] = value;
    onChange({ description: next });
  };

  const addDescription = () => onChange({ description: [...form.description, ''] });

  const removeDescription = (index: number) => {
    if (form.description.length <= 1) return;
    onChange({ description: form.description.filter((_, i) => i !== index) });
  };

  return (
    <div className="border border-[var(--color-accent)] border-opacity-30 rounded-xl p-5 mb-4 bg-[var(--color-bg-elevated)]">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        {isEdit ? 'Edit Entry' : 'Add Entry'}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Role */}
        <div>
          <label htmlFor="exp-role" className="block text-xs text-[var(--color-text-secondary)] mb-1">
            Role / Title *
          </label>
          <input
            id="exp-role"
            type="text"
            value={form.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="Senior Developer"
            className="w-full px-3 py-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          />
          {errors.role && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.role}</p>}
        </div>

        {/* Organization */}
        <div>
          <label htmlFor="exp-org" className="block text-xs text-[var(--color-text-secondary)] mb-1">
            Organization *
          </label>
          <input
            id="exp-org"
            type="text"
            value={form.organization}
            onChange={(e) => onChange({ organization: e.target.value })}
            placeholder="Acme Corp"
            className="w-full px-3 py-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          />
          {errors.organization && (
            <p className="text-xs text-[var(--color-danger)] mt-1">{errors.organization}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="exp-start" className="block text-xs text-[var(--color-text-secondary)] mb-1">
              Start Date *
            </label>
            <input
              id="exp-start"
              type="date"
              value={form.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
            {errors.startDate && (
              <p className="text-xs text-[var(--color-danger)] mt-1">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="exp-end" className="block text-xs text-[var(--color-text-secondary)] mb-1">
              End Date {form.isPresent ? '(disabled)' : '*'}
            </label>
            <input
              id="exp-end"
              type="date"
              value={form.isPresent ? '' : form.endDate}
              disabled={form.isPresent}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
            {errors.endDate && (
              <p className="text-xs text-[var(--color-danger)] mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* isPresent toggle */}
        <div className="flex items-center gap-2">
          <input
            id="exp-present"
            type="checkbox"
            checked={form.isPresent}
            onChange={(e) =>
              onChange({ isPresent: e.target.checked, endDate: e.target.checked ? '' : form.endDate })
            }
            className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
          />
          <label
            htmlFor="exp-present"
            className="text-sm text-[var(--color-text-secondary)] cursor-pointer select-none"
          >
            Currently in this role
          </label>
        </div>

        {/* Description bullets */}
        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-2">
            Description *
          </label>
          <div className="space-y-2">
            {form.description.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] text-xs mt-2.5 flex-shrink-0">›</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateDescription(i, e.target.value)}
                  placeholder={`Bullet point ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
                {form.description.length > 1 && (
                  <button
                    onClick={() => removeDescription(i)}
                    aria-label="Remove bullet"
                    className="mt-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addDescription}
            className="mt-2 text-xs text-[var(--color-accent)] hover:opacity-80 transition-opacity"
          >
            + Add bullet
          </button>
          {errors.description && (
            <p className="text-xs text-[var(--color-danger)] mt-1">{errors.description}</p>
          )}
        </div>

        {/* Root error */}
        {errors.root && (
          <p className="text-xs text-[var(--color-danger)] bg-[rgba(239,68,68,0.08)] px-3 py-2 rounded">
            {errors.root}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-[var(--color-accent)] text-[var(--color-bg-primary)] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Entry'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function ExperienceColumn({
  title,
  type,
  entries,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  deletingId,
}: {
  title: string;
  type: 'work' | 'education';
  entries: Experience[];
  onAdd: (type: 'work' | 'education') => void;
  onEdit: (entry: Experience) => void;
  onDelete: (id: string) => void;
  onReorder: (type: 'work' | 'education', newOrder: Experience[]) => void;
  deletingId: string | null;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(type, arrayMove(entries, oldIndex, newIndex));
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
          {title}
        </h2>
        <button
          onClick={() => onAdd(type)}
          className="text-xs px-3 py-1.5 rounded border border-[var(--color-border-strong)] text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] transition-colors"
        >
          + Add
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border-default)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            No {title.toLowerCase()} entries yet.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            {entries.map((entry) => (
              <SortableExperienceRow
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === entry.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ─── Manager (Client) ─────────────────────────────────────────────────────────

export default function ExperienceManager({
  initialExperience,
}: {
  initialExperience: Experience[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [entries, setEntries] = useState<Experience[]>(initialExperience);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EditingEntry>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm('work', 0));
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const workEntries = entries.filter((e) => e.type === 'work');
  const educationEntries = entries.filter((e) => e.type === 'education');

  const handleAdd = (type: 'work' | 'education') => {
    const typeEntries = entries.filter((e) => e.type === type);
    setFormData(emptyForm(type, typeEntries.length));
    setEditingEntry(null);
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (entry: Experience) => {
    setFormData({
      type: entry.type as 'work' | 'education',
      role: entry.role,
      organization: entry.organization,
      startDate: entry.startDate ? new Date(entry.startDate).toISOString().slice(0, 10) : '',
      endDate: entry.endDate ? new Date(entry.endDate).toISOString().slice(0, 10) : '',
      isPresent: entry.isPresent,
      description: entry.description.length > 0 ? entry.description : [''],
      sortOrder: entry.sortOrder,
    });
    setEditingEntry({ id: entry.id, data: formData });
    setFormErrors({});
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      description: formData.description.filter((d) => d.trim() !== ''),
    };

    const result = experienceSchema.safeParse(payload);
    if (!result.success) {
      const flat = result.error.flatten();
      const fieldErrors: FormErrors = {};
      for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
        (fieldErrors as Record<string, string>)[key] = (msgs as string[])[0] ?? '';
      }
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (editingEntry !== null) {
        const res = await fetch(`/api/admin/experience`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEntry.id, ...result.data }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setFormErrors({ root: (err as { error?: string }).error ?? 'Failed to update entry.' });
          return;
        }
        const { data: updated } = await res.json();
        setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? updated : e)));
      } else {
        const res = await fetch(`/api/admin/experience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setFormErrors({ root: (err as { error?: string }).error ?? 'Failed to create entry.' });
          return;
        }
        const { data: created } = await res.json();
        setEntries((prev) => [...prev, created]);
      }

      setShowForm(false);
      setEditingEntry(null);
      startTransition(() => router.refresh());
    } catch {
      setFormErrors({ root: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/experience`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      startTransition(() => router.refresh());
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (type: 'work' | 'education', newOrder: Experience[]) => {
    const withUpdatedSort = newOrder.map((entry, i) => ({
      ...entry,
      sortOrder: entries.filter((e) => e.type !== type).length + i,
    }));

    setEntries((prev) => [
      ...prev.filter((e) => e.type !== type),
      ...withUpdatedSort,
    ]);

    try {
      const res = await fetch('/api/admin/experience', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          withUpdatedSort.map((e) => ({ id: e.id, sortOrder: e.sortOrder }))
        ),
      });
      if (!res.ok) {
        setEntries(initialExperience);
      } else {
        startTransition(() => router.refresh());
      }
    } catch {
      setEntries(initialExperience);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Experience</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </div>

      {showForm && (
        <EntryForm
          form={formData}
          errors={formErrors}
          onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
          isEdit={editingEntry !== null}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExperienceColumn
          title="Work"
          type="work"
          entries={workEntries}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
          deletingId={deletingId}
        />
        <ExperienceColumn
          title="Education"
          type="education"
          entries={educationEntries}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}