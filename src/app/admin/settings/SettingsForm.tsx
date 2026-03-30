'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { SiteSettings } from '@/types/index';

type SettingsFormProps = {
  initialSettings: SiteSettings;
};

type FormErrors = Partial<Record<string, string>>;

const ALLOWED_ACCENT_COLORS = ['#00d4ff', '#ffe535', '#e8880a'] as const;
type AccentColor = typeof ALLOWED_ACCENT_COLORS[number];

const COLOR_LABELS: Record<AccentColor, string> = {
  '#00d4ff': 'Electric Cyan',
  '#ffe535': 'Shock Yellow',
  '#e8880a': 'Amber Wire',
};

type Toast = { type: 'success' | 'error'; message: string };

function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: AccentColor) => void;
}) {
  const current = ALLOWED_ACCENT_COLORS.includes(value as AccentColor)
    ? (value as AccentColor)
    : ALLOWED_ACCENT_COLORS[0];

  return (
    <div className="flex gap-3 mt-1">
      {ALLOWED_ACCENT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={COLOR_LABELS[color]}
          onClick={() => onChange(color)}
          style={{ backgroundColor: color }}
          className={`w-8 h-8 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] ${
            current === color
              ? 'border-white scale-110'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          aria-label={`${COLOR_LABELS[color]}${current === color ? ' (selected)' : ''}`}
        />
      ))}
    </div>
  );
}

function SectionHeader({ title, index }: { title: string; index: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className="font-mono text-[9px] tracking-[0.12em] uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {String(index).padStart(2, '0')}
      </span>
      <h2
        className="text-sm font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border-default)' }} />
    </div>
  );
}

function FieldGroup({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium uppercase tracking-[0.08em]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded text-sm font-mono transition-colors duration-150 focus:outline-none focus:ring-2"
      style={{
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-primary)',
        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border-default)'}`,
        '--tw-ring-color': 'var(--color-accent)',
      } as React.CSSProperties}
    />
  );
}

function SceneBlock({
  sceneIndex,
  values,
  onChange,
  errors,
}: {
  sceneIndex: 1 | 2 | 3;
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  errors: FormErrors;
}) {
  const [open, setOpen] = useState(sceneIndex === 1);
  const eyebrowKey = `hero_scene_${sceneIndex}_eyebrow`;
  const headlineKey = `hero_scene_${sceneIndex}_headline`;
  const supportingKey = `hero_scene_${sceneIndex}_supporting`;
  const accentColorKey = `hero_scene_${sceneIndex}_accent_color`;

  const currentAccent = values[accentColorKey] ?? ALLOWED_ACCENT_COLORS[sceneIndex - 1];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--color-border-default)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-150 hover:opacity-80"
        style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
      >
        <span className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: currentAccent }} />
          Scene {sceneIndex}
          {values[headlineKey] && (
            <span
              className="font-mono text-xs truncate max-w-[200px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              — {values[headlineKey]}
            </span>
          )}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            stroke: 'var(--color-text-tertiary)',
          }}
        >
          <path d="M2 5l5 4 5-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="p-4 flex flex-col gap-4" style={{ background: 'var(--color-bg-secondary)' }}>
          <FieldGroup label="Eyebrow" error={errors[eyebrowKey] ?? undefined}>
            <TextInput
              value={values[eyebrowKey] ?? ''}
              onChange={(v) => onChange(eyebrowKey, v)}
              placeholder="e.g. AVAILABLE FOR HIRE"
              hasError={!!errors[eyebrowKey]}
            />
          </FieldGroup>
          <FieldGroup label="Headline" error={errors[headlineKey] ?? undefined}>
            <TextInput
              value={values[headlineKey] ?? ''}
              onChange={(v) => onChange(headlineKey, v)}
              placeholder="e.g. Building the web, one volt at a time."
              hasError={!!errors[headlineKey]}
            />
          </FieldGroup>
          <FieldGroup label="Supporting Text" error={errors[supportingKey] ?? undefined}>
            <TextInput
              value={values[supportingKey] ?? ''}
              onChange={(v) => onChange(supportingKey, v)}
              placeholder="e.g. Full-stack web developer and EEE student."
              hasError={!!errors[supportingKey]}
            />
          </FieldGroup>
          <FieldGroup label="Accent Color">
            <ColorSwatchPicker
              value={currentAccent ?? ALLOWED_ACCENT_COLORS[0]}
              onChange={(color) => onChange(accentColorKey, color)}
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium"
      style={{
        background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
        color: '#fff',
      }}
      role="status"
      aria-live="polite"
    >
      {toast.type === 'success' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {toast.message}
      <button type="button" onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...initialSettings });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const emailVal = values['contact_email'];
    if (emailVal && emailVal.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal.trim())) {
        newErrors['contact_email'] = 'Please enter a valid email address';
      }
    }

    const urlFields = ['social_github', 'social_linkedin', 'social_twitter', 'seo_og_image_url', 'cv_url'];
    for (const field of urlFields) {
      const v = values[field];
      if (v && v.trim() !== '') {
        try { new URL(v.trim()); } catch {
          newErrors[field] = 'Please enter a valid URL';
        }
      }
    }

    const socialEmail = values['social_email'];
    if (socialEmail && socialEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isMailto = socialEmail.trim().startsWith('mailto:');
      const emailPart = isMailto ? socialEmail.trim().replace('mailto:', '') : socialEmail.trim();
      if (!emailRegex.test(emailPart)) {
        try { new URL(socialEmail.trim()); } catch {
          newErrors['social_email'] = 'Please enter a valid email or URL';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to save settings');
      }
      setToast({ type: 'success', message: 'Settings saved successfully' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, cv_url: 'Please select a PDF file' }));
      return;
    }
    setCvUploading(true);
    try {
      const paramsResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'cv' }),
      });
      if (!paramsResponse.ok) throw new Error('Failed to get upload parameters');

      const paramsData = (await paramsResponse.json()) as {
        data: { signature: string; timestamp: number; apiKey: string; cloudName: string };
      };
      const { signature, timestamp, apiKey, cloudName } = paramsData.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', String(timestamp));
      formData.append('api_key', apiKey);
      formData.append('folder', 'cv');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: formData }
      );
      if (!uploadResponse.ok) throw new Error('Upload to Cloudinary failed');

      const uploadData = (await uploadResponse.json()) as { secure_url: string };
      handleChange('cv_url', uploadData.secure_url);
      setToast({ type: 'success', message: 'CV uploaded — save to apply' });
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        cv_url: err instanceof Error ? err.message : 'Upload failed',
      }));
    } finally {
      setCvUploading(false);
    }
  };

  const currentCvUrl = values['cv_url'] ?? '';
  const currentOgUrl = values['seo_og_image_url'] ?? '';

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {/* Hero Scenes */}
      <section>
        <SectionHeader title="Hero Scenes" index={1} />
        <div className="flex flex-col gap-3">
          {([1, 2, 3] as const).map((i) => (
            <SceneBlock key={i} sceneIndex={i} values={values} onChange={handleChange} errors={errors} />
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section>
        <SectionHeader title="Social Links" index={2} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="GitHub URL" error={errors['social_github'] ?? undefined}>
            <TextInput value={values['social_github'] ?? ''} onChange={(v) => handleChange('social_github', v)} placeholder="https://github.com/username" hasError={!!errors['social_github']} />
          </FieldGroup>
          <FieldGroup label="LinkedIn URL" error={errors['social_linkedin'] ?? undefined}>
            <TextInput value={values['social_linkedin'] ?? ''} onChange={(v) => handleChange('social_linkedin', v)} placeholder="https://linkedin.com/in/username" hasError={!!errors['social_linkedin']} />
          </FieldGroup>
          <FieldGroup label="Twitter / X URL" error={errors['social_twitter'] ?? undefined}>
            <TextInput value={values['social_twitter'] ?? ''} onChange={(v) => handleChange('social_twitter', v)} placeholder="https://x.com/username" hasError={!!errors['social_twitter']} />
          </FieldGroup>
          <FieldGroup label="Email / Email URL" error={errors['social_email'] ?? undefined}>
            <TextInput value={values['social_email'] ?? ''} onChange={(v) => handleChange('social_email', v)} placeholder="mailto:hello@example.com" hasError={!!errors['social_email']} />
          </FieldGroup>
        </div>
      </section>

      {/* Contact Email */}
      <section>
        <SectionHeader title="Contact Email" index={3} />
        <FieldGroup label="Notification Recipient Email" error={errors['contact_email'] ?? undefined}>
          <TextInput type="email" value={values['contact_email'] ?? ''} onChange={(v) => handleChange('contact_email', v)} placeholder="hello@example.com" hasError={!!errors['contact_email']} />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Contact form submissions will be forwarded to this address.
          </p>
        </FieldGroup>
      </section>

      {/* SEO */}
      <section>
        <SectionHeader title="SEO" index={4} />
        <div className="flex flex-col gap-4">
          <FieldGroup label="Site Title" error={errors['seo_title'] ?? undefined}>
            <TextInput value={values['seo_title'] ?? ''} onChange={(v) => handleChange('seo_title', v)} placeholder="Moon — Developer Portfolio" hasError={!!errors['seo_title']} />
          </FieldGroup>
          <FieldGroup label="Meta Description" error={errors['seo_description'] ?? undefined}>
            <textarea
              value={values['seo_description'] ?? ''}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              placeholder="EEE student and full-stack developer building production web apps..."
              rows={3}
              className="w-full px-3 py-2 rounded text-sm font-mono resize-vertical transition-colors duration-150 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: `1px solid ${errors['seo_description'] ? 'var(--color-danger)' : 'var(--color-border-default)'}`,
                '--tw-ring-color': 'var(--color-accent)',
                minHeight: '80px',
              } as React.CSSProperties}
            />
          </FieldGroup>
          <FieldGroup label="OG Image URL" error={errors['seo_og_image_url'] ?? undefined}>
            <TextInput value={values['seo_og_image_url'] ?? ''} onChange={(v) => handleChange('seo_og_image_url', v)} placeholder="https://res.cloudinary.com/..." hasError={!!errors['seo_og_image_url']} />
            {currentOgUrl && !errors['seo_og_image_url'] && (
              <div className="mt-2 rounded overflow-hidden" style={{ border: '1px solid var(--color-border-default)', maxWidth: '240px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentOgUrl} alt="OG image preview" className="w-full h-auto" style={{ maxHeight: '126px', objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </FieldGroup>
        </div>
      </section>

      {/* CV Upload */}
      <section>
        <SectionHeader title="CV / Résumé" index={5} />
        <div className="flex flex-col gap-4">
          {currentCvUrl && (
            <div className="flex items-center justify-between p-3 rounded" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="2" y="1" width="12" height="14" rx="2" stroke="var(--color-text-secondary)" strokeWidth="1.2" />
                  <path d="M5 5h6M5 8h6M5 11h4" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeLinecap="round" />
                </svg>
                <span className="font-mono text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentCvUrl}
                </span>
              </div>
              <a href={currentCvUrl} target="_blank" rel="noopener noreferrer" className="ml-3 text-xs font-medium flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: 'var(--color-accent)' }}>
                Preview
              </a>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              ref={cvInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCvUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => cvInputRef.current?.click()}
              disabled={cvUploading}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-opacity duration-150 disabled:opacity-50"
              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-strong)' }}
            >
              {cvUploading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                    <circle cx="7" cy="7" r="5.5" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeDasharray="8 6" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 9V2M4 5l3-3 3 3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {currentCvUrl ? 'Replace CV (PDF)' : 'Upload CV (PDF)'}
                </>
              )}
            </button>
            {currentCvUrl && (
              <button type="button" onClick={() => handleChange('cv_url', '')} className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-tertiary)' }}>
                Remove
              </button>
            )}
          </div>
          {errors['cv_url'] && (
            <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{errors['cv_url']}</p>
          )}
          <FieldGroup label="Or paste CV URL directly">
            <TextInput value={currentCvUrl} onChange={(v) => handleChange('cv_url', v)} placeholder="https://res.cloudinary.com/.../cv.pdf" hasError={!!errors['cv_url']} />
          </FieldGroup>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--color-border-default)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Changes take effect after saving and ISR revalidation (up to 1 hour).
        </p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-opacity duration-150 disabled:opacity-50"
          style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
        >
          {isSubmitting ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                <circle cx="7" cy="7" r="5.5" stroke="var(--color-bg-primary)" strokeWidth="1.5" strokeDasharray="8 6" />
              </svg>
              Saving…
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* Profile Photo */}
      <section>
        <SectionHeader title="Profile Photo" index={6} />
        <div className="flex flex-col gap-4">
          {values['profile_photo_url'] && !errors['profile_photo_url'] && (
            <div className="rounded overflow-hidden" style={{ border: '1px solid var(--color-border-default)', maxWidth: '120px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values['profile_photo_url']} alt="Profile photo preview" className="w-full h-auto" style={{ maxHeight: '120px', objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <FieldGroup label="Profile Photo URL" error={errors['profile_photo_url'] ?? undefined}>
            <TextInput value={values['profile_photo_url'] ?? ''} onChange={(v) => handleChange('profile_photo_url', v)} placeholder="https://res.cloudinary.com/.../photo.jpg" hasError={!!errors['profile_photo_url']} />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Shown in the About section as a circular profile picture. Use a Cloudinary URL or paste the image URL directly.
            </p>
          </FieldGroup>
        </div>
      </section>

      {/* Availability */}
      <section>
        <SectionHeader title="Availability" index={6} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Status" error={errors['availability_status'] ?? undefined}>
            <select
              value={values['availability_status'] ?? 'open'}
              onChange={(e) => handleChange('availability_status', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono transition-colors duration-150 focus:outline-none focus:ring-2"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)' }}
            >
              <option value="open">Open to opportunities</option>
              <option value="busy">Currently busy</option>
              <option value="closed">Not available</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Status Label" error={errors['availability_label'] ?? undefined}>
            <TextInput value={values['availability_label'] ?? ''} onChange={(v) => handleChange('availability_label', v)} placeholder="Available for freelance & internships" hasError={!!errors['availability_label']} />
          </FieldGroup>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <SectionHeader title="Testimonials" index={7} />
        <div className="flex flex-col gap-6">
          {([1, 2, 3] as const).map((i) => (
            <div key={i} className="flex flex-col gap-4 p-4 rounded-lg" style={{ border: '1px solid var(--color-border-default)', background: 'var(--color-bg-secondary)' }}>
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Testimonial {i}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Name">
                  <TextInput value={values[`testimonial_${i}_name`] ?? ''} onChange={(v) => handleChange(`testimonial_${i}_name`, v)} placeholder="Jane Smith" />
                </FieldGroup>
                <FieldGroup label="Role / Company">
                  <TextInput value={values[`testimonial_${i}_role`] ?? ''} onChange={(v) => handleChange(`testimonial_${i}_role`, v)} placeholder="CEO at Acme Corp" />
                </FieldGroup>
              </div>
              <FieldGroup label="Quote">
                <textarea
                  value={values[`testimonial_${i}_text`] ?? ''}
                  onChange={(e) => handleChange(`testimonial_${i}_text`, e.target.value)}
                  placeholder="Moon delivered exceptional work..."
                  rows={3}
                  className="w-full px-3 py-2 rounded text-sm font-mono resize-vertical transition-colors duration-150 focus:outline-none focus:ring-2"
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', minHeight: '80px' } as React.CSSProperties}
                />
              </FieldGroup>
            </div>
          ))}
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Leave all fields empty to hide a testimonial. Testimonials with a name and quote will appear in the About section.
          </p>
        </div>
      </section>

      {toast && <ToastNotification toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}