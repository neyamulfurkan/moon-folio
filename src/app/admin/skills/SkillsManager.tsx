'use client';

import React, { useState, useCallback } from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Skill } from '@/types/index';
import { skillSchema, type SkillFormData } from '@/validations/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkillsByCategory = Record<string, Skill[]>;

interface AddSkillFormState {
  name: string;
  category: SkillFormData['category'];
  proficiency: number;
  sortOrder: number;
}

interface SortableSkillRowProps {
  skill: Skill;
  onDelete: (id: string) => void;
}

interface CategorySectionProps {
  category: string;
  skills: Skill[];
  onReorder: (category: string, newOrder: Skill[]) => void;
  onDelete: (id: string) => void;
  onAddSkill: (data: AddSkillFormState) => Promise<void>;
  allSkills: Skill[];
}

interface SkillsManagerProps {
  initialSkills: Skill[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: SkillFormData['category'][] = ['web', 'hardware', 'tools', 'learning'];

const CATEGORY_LABELS: Record<string, string> = {
  web: 'Web',
  hardware: 'Hardware',
  tools: 'Tools',
  learning: 'Currently Learning',
};

// ---------------------------------------------------------------------------
// Star Rating
// ---------------------------------------------------------------------------

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}): React.ReactElement => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Proficiency rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered ?? value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: filled ? 'var(--color-electric)' : 'var(--color-border-strong)',
              fontSize: '18px',
              lineHeight: 1,
              transition: 'color 120ms',
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sortable Skill Row
// ---------------------------------------------------------------------------

const SortableSkillRow = ({ skill, onDelete }: SortableSkillRowProps): React.ReactElement => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 rounded"
      aria-label={`Skill: ${skill.name}`}
      role="row"
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        style={{ background: 'none', border: 'none', cursor: 'grab', color: 'var(--color-text-tertiary)', padding: '4px', display: 'flex', alignItems: 'center', touchAction: 'none' }}
      >
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <rect x="2" y="2" width="3" height="3" rx="1" />
          <rect x="7" y="2" width="3" height="3" rx="1" />
          <rect x="2" y="6.5" width="3" height="3" rx="1" />
          <rect x="7" y="6.5" width="3" height="3" rx="1" />
          <rect x="2" y="11" width="3" height="3" rx="1" />
          <rect x="7" y="11" width="3" height="3" rx="1" />
        </svg>
      </button>

      {/* Skill Name */}
      <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
        {skill.name}
      </span>

      {/* Proficiency Stars */}
      <div className="flex gap-0.5" aria-label={`Proficiency: ${skill.proficiency} of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ fontSize: '13px', color: star <= skill.proficiency ? 'var(--color-electric)' : 'var(--color-border-strong)' }}>★</span>
        ))}
      </div>

      {/* Delete / Confirm */}
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>Remove?</span>
          <button type="button" onClick={() => onDelete(skill.id)} aria-label={`Confirm delete ${skill.name}`} style={{ background: 'var(--color-danger)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: 'var(--text-xs)', padding: '2px 8px', cursor: 'pointer' }}>Yes</button>
          <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete" style={{ background: 'none', border: '1px solid var(--color-border-strong)', borderRadius: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', padding: '2px 8px', cursor: 'pointer' }}>No</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete ${skill.name}`}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1, transition: 'color 120ms' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
        >
          ×
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Add Skill Form
// ---------------------------------------------------------------------------

const AddSkillForm = ({
  defaultCategory,
  onAdd,
  existingSkills,
}: {
  defaultCategory: SkillFormData['category'];
  onAdd: (data: AddSkillFormState) => Promise<void>;
  existingSkills: Skill[];
}): React.ReactElement => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillFormData['category']>(defaultCategory);
  const [proficiency, setProficiency] = useState(3);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [warning, setWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (v: string): void => {
    setName(v);
    setWarning(null);
    const dup = existingSkills.find(
      (s) => s.name.trim().toLowerCase() === v.trim().toLowerCase() && s.category === category
    );
    if (dup) setWarning(`"${v}" already exists in ${CATEGORY_LABELS[category]}.`);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const result = skillSchema.safeParse({
      name,
      category,
      proficiency,
      sortOrder: existingSkills.filter((s) => s.category === category).length,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(result.data);
      setName('');
      setProficiency(3);
      setWarning(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{ background: 'var(--color-bg-elevated)', borderTop: '1px solid var(--color-border-default)', padding: '16px', borderRadius: '0 0 8px 8px' }}
    >
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Add Skill
      </p>

      <div className="flex flex-wrap gap-3 items-start">
        {/* Name */}
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Skill name"
            aria-label="Skill name"
            aria-invalid={!!errors['name']}
            style={{ width: '100%', background: 'var(--color-bg-secondary)', border: `1px solid ${errors['name'] ? 'var(--color-danger)' : 'var(--color-border-default)'}`, borderRadius: '8px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', padding: '8px 12px', outline: 'none' }}
          />
          {errors['name'] && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '4px' }}>{errors['name']}</p>}
          {warning && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber)', marginTop: '4px' }}>⚠ {warning}</p>}
        </div>

        {/* Category */}
        <div style={{ flex: '0 0 140px' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillFormData['category'])}
            aria-label="Category"
            style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: '8px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', padding: '8px 12px', outline: 'none', cursor: 'pointer' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Proficiency */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>Level</span>
          <StarRating value={proficiency} onChange={setProficiency} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: 'var(--color-bg-primary)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, padding: '8px 20px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {isSubmitting ? 'Adding…' : '+ Add'}
        </button>
      </div>
    </form>
  );
};

// ---------------------------------------------------------------------------
// Category Section
// ---------------------------------------------------------------------------

const CategorySection = ({
  category,
  skills,
  onReorder,
  onDelete,
  onAddSkill,
  allSkills,
}: CategorySectionProps): React.ReactElement => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(category, arrayMove(skills, oldIndex, newIndex));
  };

  return (
    <section
      aria-labelledby={`category-heading-${category}`}
      style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: '8px', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-tertiary)' }}>
        <div className="flex items-center gap-3">
          <h2 id={`category-heading-${category}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            {CATEGORY_LABELS[category]}
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Skill List */}
      <div role="table" aria-label={`${CATEGORY_LABELS[category]} skills`}>
        {skills.length === 0 ? (
          <p style={{ padding: '24px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            No skills in this category yet.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div role="rowgroup">
                {skills.map((skill) => (
                  <SortableSkillRow key={skill.id} skill={skill} onDelete={onDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Form */}
      <AddSkillForm
        defaultCategory={category as SkillFormData['category']}
        onAdd={onAddSkill}
        existingSkills={allSkills}
      />
    </section>
  );
};

// ---------------------------------------------------------------------------
// Skills Manager (Client Component)
// ---------------------------------------------------------------------------

export default function SkillsManager({ initialSkills }: SkillsManagerProps): React.ReactElement {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const skillsByCategory = useCallback((): SkillsByCategory => {
    const grouped: SkillsByCategory = {};
    for (const category of CATEGORIES) {
      grouped[category] = skills.filter((s) => s.category === category);
    }
    return grouped;
  }, [skills]);

  const handleReorder = async (category: string, newOrder: Skill[]): Promise<void> => {
    setSkills((prev) => {
      const others = prev.filter((s) => s.category !== category);
      const updated = newOrder.map((s, i) => ({ ...s, sortOrder: i }));
      return [...others, ...updated];
    });
    try {
      const body = newOrder.map((s, i) => ({ id: s.id, sortOrder: i }));
      const res = await fetch('/api/admin/skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Reorder failed');
    } catch {
      showToast('Failed to save new order', 'error');
      setSkills(initialSkills);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    const previous = skills;
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Skill removed', 'success');
    } catch {
      showToast('Failed to delete skill', 'error');
      setSkills(previous);
    }
  };

  const handleAddSkill = async (data: AddSkillFormState): Promise<void> => {
    const res = await fetch('/api/admin/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      showToast(json.error ?? 'Failed to add skill', 'error');
      return;
    }
    const json = (await res.json()) as { data: Skill };
    setSkills((prev) => [...prev, json.data]);
    showToast(`"${json.data.name}" added`, 'success');
  };

  const grouped = skillsByCategory();

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-display)', zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {CATEGORIES.map((category) => (
          <CategorySection
            key={category}
            category={category}
            skills={grouped[category] ?? []}
            onReorder={handleReorder}
            onDelete={(id) => void handleDelete(id)}
            onAddSkill={handleAddSkill}
            allSkills={skills}
          />
        ))}
      </div>
    </div>
  );
}