'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { projectUpdateSchema } from '@/validations/project';
import { slugify } from '@/lib/utils';
import type { Project } from '@/types/index';
import type { ProjectFormData } from '@/validations/project';

type AdminEditProjectClientProps = {
  project: Project;
};

async function getSignedUploadParams(folder: string): Promise<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}> {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error('Failed to get upload params');
  return res.json() as Promise<{ signature: string; timestamp: number; apiKey: string; cloudName: string }>;
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const params = await getSignedUploadParams(folder);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', params.signature);
  formData.append('timestamp', String(params.timestamp));
  formData.append('api_key', params.apiKey);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontFamily: 'var(--font-display)',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
};

const errorStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '12px',
  color: 'var(--color-danger)',
  fontFamily: 'var(--font-display)',
};

const AdminEditProjectClient: React.FC<AdminEditProjectClientProps> = ({ project }) => {
  const router = useRouter();
  const originalSlug = useRef(project.slug);
  const isDirty = useRef(false);

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [shortDesc, setShortDesc] = useState(project.shortDesc);
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(project.techStack);
  const [category, setCategory] = useState(project.category);
  const [featured, setFeatured] = useState(project.featured);
  const [published, setPublished] = useState(project.published);
  const [sortOrder, setSortOrder] = useState(project.sortOrder);
  const [thumbnailUrl, setThumbnailUrl] = useState(project.thumbnailUrl ?? '');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(project.galleryUrls ?? []);
  const [liveUrl, setLiveUrl] = useState(project.liveUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(project.githubUrl ?? '');
  const [challenge, setChallenge] = useState(project.challenge ?? '');
  const [solution, setSolution] = useState(project.solution ?? '');

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: project.fullDesc,
    onUpdate: () => {
      isDirty.current = true;
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const markDirty = () => { isDirty.current = true; };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    markDirty();
    if (!slugManuallyEdited) setSlug(slugify(val));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
    markDirty();
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techStackInput.trim().replace(/,$/, '');
      if (val && !techStack.includes(val)) {
        setTechStack((prev) => [...prev, val]);
        markDirty();
      }
      setTechStackInput('');
    }
  };

  const removeTechStack = (item: string) => {
    setTechStack((prev) => prev.filter((t) => t !== item));
    markDirty();
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'projects');
      setThumbnailUrl(url);
      markDirty();
    } catch {
      setServerError('Thumbnail upload failed.');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (galleryUrls.length + files.length > 8) {
      setErrors((prev) => ({ ...prev, galleryUrls: 'Gallery can contain at most 8 images.' }));
      return;
    }
    setGalleryUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f, 'gallery'))
      );
      setGalleryUrls((prev) => [...prev, ...uploaded]);
      markDirty();
    } catch {
      setServerError('Gallery upload failed.');
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
    markDirty();
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors({});
      setServerError(null);

      const fullDesc = editor?.getHTML() ?? '';

      const payload: Partial<ProjectFormData> = {
        title,
        slug,
        shortDesc,
        fullDesc,
        techStack,
        category,
        featured,
        published,
        sortOrder: Number(sortOrder),
        thumbnailUrl: thumbnailUrl || '',
        galleryUrls,
        liveUrl: liveUrl || '',
        githubUrl: githubUrl || '',
        challenge: challenge || undefined,
        solution: solution || undefined,
      };

      const validation = projectUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        for (const err of validation.error.errors) {
          const key = err.path.join('.');
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/admin/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validation.data),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          if (res.status === 409) {
            setErrors((prev) => ({ ...prev, slug: 'This slug is already taken. Choose a different one.' }));
          } else {
            setServerError(data.error ?? 'Failed to update project.');
          }
          return;
        }

        isDirty.current = false;
        router.push('/admin/projects');
        router.refresh();
      } catch {
        setServerError('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      editor, title, slug, shortDesc, techStack, category,
      featured, published, sortOrder, thumbnailUrl, galleryUrls,
      liveUrl, githubUrl, challenge, solution, project.id, router,
    ]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setServerError(data.error ?? 'Failed to delete project.');
        setShowDeleteConfirm(false);
        return;
      }
      isDirty.current = false;
      router.push('/admin/projects');
      router.refresh();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const slugChanged = slug !== originalSlug.current;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-display)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <a href="/admin/projects" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← Back to Projects
          </a>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Edit Project
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          style={{ padding: '8px 16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
        >
          Delete Project
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div role="alertdialog" aria-labelledby="delete-confirm-title" style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
          <p id="delete-confirm-title" style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Are you sure you want to delete <strong>{project.title}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ padding: '8px 16px', backgroundColor: 'var(--color-danger)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', opacity: isDeleting ? 0.6 : 1 }}
            >
              {isDeleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Server error */}
      {serverError !== null && (
        <div role="alert" style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '13px' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={labelStyle}>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input
            id="title" type="text" value={title} onChange={handleTitleChange}
            style={{ ...fieldStyle, borderColor: errors['title'] ? 'var(--color-danger)' : 'var(--color-border-default)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors['title'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }}
          />
          {errors['title'] && <p style={errorStyle}>{errors['title']}</p>}
        </div>

        {/* Slug */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="slug" style={labelStyle}>Slug <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input
            id="slug" type="text" value={slug} onChange={handleSlugChange}
            style={{ ...fieldStyle, fontFamily: 'var(--font-mono)', borderColor: errors['slug'] ? 'var(--color-danger)' : slugChanged ? 'var(--color-amber)' : 'var(--color-border-default)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors['slug'] ? 'var(--color-danger)' : slugChanged ? 'var(--color-amber)' : 'var(--color-border-default)'; }}
          />
          {slugChanged && !errors['slug'] && (
            <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--color-amber)', fontFamily: 'var(--font-display)' }}>
              ⚠ Changing the slug will break existing links.
            </p>
          )}
          {errors['slug'] && <p style={errorStyle}>{errors['slug']}</p>}
        </div>

        {/* Short Description */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="shortDesc" style={labelStyle}>
            Short Description{' '}
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>({shortDesc.length}/160)</span>
          </label>
          <input
            id="shortDesc" type="text" value={shortDesc} maxLength={160}
            onChange={(e) => { setShortDesc(e.target.value); markDirty(); }}
            style={{ ...fieldStyle, borderColor: errors['shortDesc'] ? 'var(--color-danger)' : 'var(--color-border-default)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors['shortDesc'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }}
          />
          {errors['shortDesc'] && <p style={errorStyle}>{errors['shortDesc']}</p>}
        </div>

        {/* Full Description (Tiptap) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Full Description</label>
          <div
            style={{ border: `1px solid ${errors['fullDesc'] ? 'var(--color-danger)' : 'var(--color-border-default)'}`, borderRadius: '8px', backgroundColor: 'var(--color-bg-tertiary)', minHeight: '200px', padding: '12px', color: 'var(--color-text-primary)', fontSize: '14px', cursor: 'text' }}
            onClick={() => editor?.commands.focus()}
          >
            <EditorContent editor={editor} />
          </div>
          {errors['fullDesc'] && <p style={errorStyle}>{errors['fullDesc']}</p>}
        </div>

        {/* Tech Stack */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="techStackInput" style={labelStyle}>Tech Stack <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {techStack.map((item) => (
              <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {item}
                <button type="button" onClick={() => removeTechStack(item)} aria-label={`Remove ${item}`} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0 2px', fontSize: '14px', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <input
            id="techStackInput" type="text" value={techStackInput}
            placeholder="Type a tech and press Enter or comma"
            onChange={(e) => setTechStackInput(e.target.value)}
            onKeyDown={handleTechStackKeyDown}
            style={{ ...fieldStyle, borderColor: errors['techStack'] ? 'var(--color-danger)' : 'var(--color-border-default)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors['techStack'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }}
          />
          {errors['techStack'] && <p style={errorStyle}>{errors['techStack']}</p>}
        </div>

        {/* Category + Sort Order */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="category" style={labelStyle}>Category <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <select
              id="category" value={category}
              onChange={(e) => { setCategory(e.target.value); markDirty(); }}
              style={{ ...fieldStyle, appearance: 'none', borderColor: errors['category'] ? 'var(--color-danger)' : 'var(--color-border-default)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors['category'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }}
            >
              <option value="web">web</option>
              <option value="hardware">hardware</option>
              <option value="fullstack">fullstack</option>
            </select>
            {errors['category'] && <p style={errorStyle}>{errors['category']}</p>}
          </div>
          <div>
            <label htmlFor="sortOrder" style={labelStyle}>Sort Order</label>
            <input
              id="sortOrder" type="number" min={0} value={sortOrder}
              onChange={(e) => { setSortOrder(Number(e.target.value)); markDirty(); }}
              style={{ ...fieldStyle, borderColor: errors['sortOrder'] ? 'var(--color-danger)' : 'var(--color-border-default)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors['sortOrder'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }}
            />
            {errors['sortOrder'] && <p style={errorStyle}>{errors['sortOrder']}</p>}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          {(['featured', 'published'] as const).map((field) => {
            const val = field === 'featured' ? featured : published;
            const setter = field === 'featured' ? setFeatured : setPublished;
            return (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-secondary)', userSelect: 'none' }}>
                <input type="checkbox" checked={val} onChange={(e) => { setter(e.target.checked); markDirty(); }} style={{ accentColor: 'var(--color-accent)', width: '14px', height: '14px' }} />
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            );
          })}
        </div>

        {/* Thumbnail */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Thumbnail Image</label>
          {thumbnailUrl && (
            <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailUrl} alt="Thumbnail preview" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border-default)' }} />
              <button type="button" onClick={() => { setThumbnailUrl(''); markDirty(); }} aria-label="Remove thumbnail" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={thumbnailUploading} style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)' }} />
          {thumbnailUploading && <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '4px' }}>Uploading…</p>}
          {errors['thumbnailUrl'] && <p style={errorStyle}>{errors['thumbnailUrl']}</p>}
        </div>

        {/* Gallery */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Gallery Images ({galleryUrls.length}/8)</label>
          {galleryUrls.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {galleryUrls.map((url) => (
                <div key={url} style={{ position: 'relative', display: 'inline-block' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Gallery image" style={{ height: '64px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border-default)' }} />
                  <button type="button" onClick={() => removeGalleryImage(url)} aria-label="Remove gallery image" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}
          {galleryUrls.length < 8 && (
            <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={galleryUploading} style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)' }} />
          )}
          {galleryUploading && <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '4px' }}>Uploading…</p>}
          {errors['galleryUrls'] && <p style={errorStyle}>{errors['galleryUrls']}</p>}
        </div>

        {/* URLs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="liveUrl" style={labelStyle}>Live URL</label>
            <input id="liveUrl" type="url" value={liveUrl} placeholder="https://..." onChange={(e) => { setLiveUrl(e.target.value); markDirty(); }} style={{ ...fieldStyle, borderColor: errors['liveUrl'] ? 'var(--color-danger)' : 'var(--color-border-default)' }} onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors['liveUrl'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }} />
            {errors['liveUrl'] && <p style={errorStyle}>{errors['liveUrl']}</p>}
          </div>
          <div>
            <label htmlFor="githubUrl" style={labelStyle}>GitHub URL</label>
            <input id="githubUrl" type="url" value={githubUrl} placeholder="https://github.com/..." onChange={(e) => { setGithubUrl(e.target.value); markDirty(); }} style={{ ...fieldStyle, borderColor: errors['githubUrl'] ? 'var(--color-danger)' : 'var(--color-border-default)' }} onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors['githubUrl'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }} />
            {errors['githubUrl'] && <p style={errorStyle}>{errors['githubUrl']}</p>}
          </div>
        </div>

        {/* Challenge */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="challenge" style={labelStyle}>Challenge</label>
          <textarea id="challenge" value={challenge} rows={4} onChange={(e) => { setChallenge(e.target.value); markDirty(); }} style={{ ...fieldStyle, resize: 'vertical', minHeight: '96px', borderColor: errors['challenge'] ? 'var(--color-danger)' : 'var(--color-border-default)' }} onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors['challenge'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }} />
          {errors['challenge'] && <p style={errorStyle}>{errors['challenge']}</p>}
        </div>

        {/* Solution */}
        <div style={{ marginBottom: '32px' }}>
          <label htmlFor="solution" style={labelStyle}>Solution</label>
          <textarea id="solution" value={solution} rows={4} onChange={(e) => { setSolution(e.target.value); markDirty(); }} style={{ ...fieldStyle, resize: 'vertical', minHeight: '96px', borderColor: errors['solution'] ? 'var(--color-danger)' : 'var(--color-border-default)' }} onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors['solution'] ? 'var(--color-danger)' : 'var(--color-border-default)'; }} />
          {errors['solution'] && <p style={errorStyle}>{errors['solution']}</p>}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ padding: '12px 28px', backgroundColor: isSubmitting ? 'var(--color-accent-dim)' : 'var(--color-accent)', color: 'var(--color-bg-primary)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 150ms' }}
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
          <a href="/admin/projects" style={{ padding: '12px 20px', backgroundColor: 'transparent', border: '1px solid var(--color-border-default)', borderRadius: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProjectClient;