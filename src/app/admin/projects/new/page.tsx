'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { projectSchema, type ProjectFormData } from '@/validations/project';
import { PROJECT_CATEGORIES } from '@/lib/constants';
import { slugify, cn } from '@/lib/utils';

type UploadState = {
  isUploading: boolean;
  error: string | null;
};

type FormErrors = Partial<Record<keyof ProjectFormData, string>>;

const ALLOWED_FOLDERS = ['projects', 'gallery'] as const;

async function getSignedParams(folder: string): Promise<{
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
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Failed to get upload credentials');
  }
  const json = await res.json() as { data?: { signature: string; timestamp: number; apiKey: string; cloudName: string }; signature?: string; timestamp?: number; apiKey?: string; cloudName?: string };
  const params = json.data ?? (json as { signature: string; timestamp: number; apiKey: string; cloudName: string });
  if (!params?.cloudName) {
    throw new Error('Cloudinary cloud name missing from server response. Ensure CLOUDINARY_CLOUD_NAME is set in Vercel environment variables.');
  }
  return params;
}

async function uploadToCloudinary(
  file: File,
  params: { signature: string; timestamp: number; apiKey: string; cloudName: string },
  folder: string
): Promise<string> {
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

  if (!res.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

export default function AdminNewProjectPage(): JSX.Element {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [shortDesc, setShortDesc] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [category, setCategory] = useState<string>(PROJECT_CATEGORIES[0]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [thumbnailUpload, setThumbnailUpload] = useState<UploadState>({ isUploading: false, error: null });
  const [galleryUpload, setGalleryUpload] = useState<UploadState>({ isUploading: false, error: null });

  const isDirty = useRef(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] p-4 focus:outline-none text-[var(--color-text-primary)] text-sm',
      },
    },
  });

  // Mark dirty on any field change
  useEffect(() => {
    if (title || shortDesc || techStack.length || thumbnailUrl) {
      isDirty.current = true;
    }
  }, [title, shortDesc, techStack, thumbnailUrl]);

  // Beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent): string | undefined => {
      if (!isDirty.current) return undefined;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const addTechChip = useCallback((value: string): void => {
    const trimmed = value.trim().replace(/,$/, '').trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
      isDirty.current = true;
    }
    setTechInput('');
  }, [techStack]);

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechChip(techInput);
    }
  };

  const handleTechBlur = (): void => {
    if (techInput.trim()) addTechChip(techInput);
  };

  const removeTech = (index: number): void => {
    setTechStack((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUpload({ isUploading: true, error: null });
    try {
      const params = await getSignedParams('projects');
      const url = await uploadToCloudinary(file, params, 'projects');
      setThumbnailUrl(url);
      isDirty.current = true;
    } catch (err) {
      setThumbnailUpload({ isUploading: false, error: (err as Error).message });
      return;
    }
    setThumbnailUpload({ isUploading: false, error: null });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 8 - galleryUrls.length;
    const toUpload = files.slice(0, remaining);
    if (!toUpload.length) return;

    setGalleryUpload({ isUploading: true, error: null });
    try {
      const params = await getSignedParams('projects');
      const urls = await Promise.all(
        toUpload.map((file) => uploadToCloudinary(file, params, 'projects'))
      );
      setGalleryUrls((prev) => [...prev, ...urls].slice(0, 8));
      isDirty.current = true;
    } catch (err) {
      setGalleryUpload({ isUploading: false, error: (err as Error).message });
      return;
    }
    setGalleryUpload({ isUploading: false, error: null });
  };

  const removeGalleryImage = (index: number): void => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    const fullDesc = editor?.getHTML() ?? '';

    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim(),
      shortDesc: shortDesc.trim(),
      fullDesc,
      techStack,
      category,
      featured,
      published,
      thumbnailUrl: thumbnailUrl || '',
      galleryUrls: galleryUrls.length > 0 ? galleryUrls : undefined,
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      challenge: challenge.trim() || undefined,
      solution: solution.trim() || undefined,
      sortOrder: 0,
    };

    const result = projectSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProjectFormData;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, slug: 'This slug is already in use. Change the slug or title.' }));
        } else {
          setSubmitError((data as { error?: string }).error ?? 'Failed to create project');
        }
        return;
      }

      isDirty.current = false;
      router.push('/admin/projects');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean): string =>
    cn(
      'w-full bg-[var(--color-bg-tertiary)] border rounded px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors',
      hasError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-default)]'
    );

  const labelClass = 'block text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-widest';
  const errorClass = 'text-xs text-[var(--color-danger)] mt-1';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)] font-mono mb-1">admin / projects /</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">New Project</h1>
        </div>
        <a
          href="/admin/projects"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ← Back
        </a>
      </div>

      {submitError && (
        <div className="mb-6 p-3 rounded border border-[var(--color-danger)] bg-[rgba(239,68,68,0.08)] text-sm text-[var(--color-danger)]">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); isDirty.current = true; }}
              placeholder="My Awesome Project"
              className={inputClass(!!errors.title)}
              autoComplete="off"
            />
            {errors.title && <p className={errorClass}>{errors.title}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="slug">Slug *</label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); isDirty.current = true; }}
              placeholder="my-awesome-project"
              className={inputClass(!!errors.slug)}
              autoComplete="off"
            />
            {errors.slug && <p className={errorClass}>{errors.slug}</p>}
            {!slugManual && slug && (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Auto-generated. Edit to override.</p>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className={labelClass} htmlFor="shortDesc">Short Description</label>
          <input
            id="shortDesc"
            type="text"
            value={shortDesc}
            onChange={(e) => { setShortDesc(e.target.value); isDirty.current = true; }}
            placeholder="One-line summary (max 160 chars)"
            maxLength={160}
            className={inputClass(!!errors.shortDesc)}
          />
          <div className="flex justify-between mt-1">
            {errors.shortDesc ? <p className={errorClass}>{errors.shortDesc}</p> : <span />}
            <span className="text-xs text-[var(--color-text-tertiary)]">{shortDesc.length}/160</span>
          </div>
        </div>

        {/* Full Description (Tiptap) */}
        <div>
          <label className={labelClass}>Full Description</label>
          <div className="border border-[var(--color-border-default)] rounded overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)]">
              {[
                { label: 'B', command: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
                { label: 'I', command: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
                { label: 'Code', command: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive('code') },
                { label: 'H2', command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
                { label: 'H3', command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                { label: 'UL', command: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
                { label: 'OL', command: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
                { label: '```', command: () => editor?.chain().focus().toggleCodeBlock().run(), active: editor?.isActive('codeBlock') },
              ].map(({ label, command, active }) => (
                <button
                  key={label}
                  type="button"
                  onClick={command}
                  className={cn(
                    'px-2 py-1 text-xs rounded font-mono transition-colors',
                    active
                      ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="bg-[var(--color-bg-secondary)]">
              <EditorContent editor={editor} />
            </div>
          </div>
          {errors.fullDesc && <p className={errorClass}>{errors.fullDesc}</p>}
        </div>

        {/* Tech Stack */}
        <div>
          <label className={labelClass} htmlFor="techInput">Tech Stack *</label>
          <div className={cn(
            'flex flex-wrap gap-2 p-2 border rounded min-h-[44px] bg-[var(--color-bg-tertiary)] cursor-text',
            errors.techStack ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-default)]'
          )}
            onClick={() => document.getElementById('techInput')?.focus()}
          >
            {techStack.map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-mono"
              >
                {tech}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTech(i); }}
                  className="hover:text-white transition-colors leading-none"
                  aria-label={`Remove ${tech}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="techInput"
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              onBlur={handleTechBlur}
              placeholder={techStack.length === 0 ? 'Type and press Enter or comma...' : ''}
              className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none"
            />
          </div>
          {errors.techStack && <p className={errorClass}>{errors.techStack}</p>}
        </div>

        {/* Category + Featured + Published */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(inputClass(!!errors.category), 'cursor-pointer')}
            >
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className={errorClass}>{errors.category}</p>}
          </div>

          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)] rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)] rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Published</span>
            </label>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className={labelClass}>Thumbnail</label>
          <div className="flex items-start gap-4">
            {thumbnailUrl ? (
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-24 h-16 object-cover rounded border border-[var(--color-border-default)]"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--color-danger)] text-white text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Remove thumbnail"
                >
                  ×
                </button>
              </div>
            ) : null}
            <div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnailFile"
              />
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={thumbnailUpload.isUploading}
                className={cn(
                  'px-4 py-2 text-sm rounded border transition-colors',
                  'border-[var(--color-border-strong)] text-[var(--color-text-primary)]',
                  'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {thumbnailUpload.isUploading ? 'Uploading...' : thumbnailUrl ? 'Replace Image' : 'Upload Image'}
              </button>
              {thumbnailUpload.error && <p className={errorClass}>{thumbnailUpload.error}</p>}
              {errors.thumbnailUrl && <p className={errorClass}>{errors.thumbnailUrl}</p>}
            </div>
          </div>
        </div>

        {/* Gallery Upload */}
        <div>
          <label className={labelClass}>Gallery ({galleryUrls.length}/8)</label>
          {galleryUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery image ${i + 1}`}
                    className="w-20 h-14 object-cover rounded border border-[var(--color-border-default)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-danger)] text-white text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label={`Remove gallery image ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryUrls.length < 8 && (
            <>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                id="galleryFiles"
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUpload.isUploading}
                className={cn(
                  'px-4 py-2 text-sm rounded border transition-colors',
                  'border-[var(--color-border-strong)] text-[var(--color-text-primary)]',
                  'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {galleryUpload.isUploading ? 'Uploading...' : 'Add Images'}
              </button>
              {galleryUpload.error && <p className={errorClass}>{galleryUpload.error}</p>}
            </>
          )}
        </div>

        {/* Live URL + GitHub URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="liveUrl">Live URL</label>
            <input
              id="liveUrl"
              type="url"
              value={liveUrl}
              onChange={(e) => { setLiveUrl(e.target.value); isDirty.current = true; }}
              placeholder="https://example.com"
              className={inputClass(!!errors.liveUrl)}
            />
            {errors.liveUrl && <p className={errorClass}>{errors.liveUrl}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="githubUrl">GitHub URL</label>
            <input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => { setGithubUrl(e.target.value); isDirty.current = true; }}
              placeholder="https://github.com/user/repo"
              className={inputClass(!!errors.githubUrl)}
            />
            {errors.githubUrl && <p className={errorClass}>{errors.githubUrl}</p>}
          </div>
        </div>

        {/* Challenge + Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="challenge">Challenge</label>
            <textarea
              id="challenge"
              value={challenge}
              onChange={(e) => { setChallenge(e.target.value); isDirty.current = true; }}
              placeholder="What problem did you solve?"
              rows={4}
              maxLength={5000}
              className={cn(inputClass(!!errors.challenge), 'resize-vertical min-h-[100px]')}
            />
            {errors.challenge && <p className={errorClass}>{errors.challenge}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="solution">Solution</label>
            <textarea
              id="solution"
              value={solution}
              onChange={(e) => { setSolution(e.target.value); isDirty.current = true; }}
              placeholder="How did you solve it?"
              rows={4}
              maxLength={5000}
              className={cn(inputClass(!!errors.solution), 'resize-vertical min-h-[100px]')}
            />
            {errors.solution && <p className={errorClass}>{errors.solution}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border-default)]">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2.5 rounded text-sm font-medium transition-colors',
              'bg-[var(--color-accent)] text-[var(--color-bg-primary)]',
              'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
          <a
            href="/admin/projects"
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}