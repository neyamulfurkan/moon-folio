'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { contactSchema } from '@/validations/contact';
import type { ContactFormData } from '@/validations/contact';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ElectricButton } from '@/components/ui/ElectricButton';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  onSuccess: () => void;
};

type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

const FIELD_PERIMETER_APPROX = 2 * (560 + 56);

const FloatingField = ({
  id,
  label,
  value,
  error,
  isReduced,
  children,
}: {
  id: string;
  label: string;
  value: string;
  error?: string | undefined;
  isReduced: boolean;
  children: React.ReactNode;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rectRef = useRef<SVGRectElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Animation | null>(null);
  const [dims, setDims] = useState({ width: 0, height: 0, perimeter: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDims({ width, height, perimeter: 2 * (width + height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const rect = rectRef.current;
    if (!rect || dims.perimeter === 0) return;
    rect.style.strokeDasharray = `${dims.perimeter}`;
    if (!isFocused) {
      rect.style.strokeDashoffset = `${dims.perimeter}`;
    }
  }, [dims.perimeter, isFocused]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (isReduced || !rectRef.current || dims.perimeter === 0) return;
    if (animRef.current) animRef.current.cancel();
    rectRef.current.style.strokeDashoffset = `${dims.perimeter}`;
    animRef.current = rectRef.current.animate(
      [
        { strokeDashoffset: dims.perimeter },
        { strokeDashoffset: 0 },
        { strokeDashoffset: -dims.perimeter },
      ],
      {
        duration: 1500,
        easing: 'linear',
        iterations: Infinity,
      }
    );
  }, [isReduced, dims.perimeter]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!rectRef.current) return;
    if (animRef.current) {
      animRef.current.cancel();
      animRef.current = null;
    }
    rectRef.current.style.strokeDashoffset = `${dims.perimeter}`;
  }, [dims.perimeter]);

  const hasValue = value.length > 0;
  const labelFloated = hasValue || isFocused;

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={cn(
          'relative',
          error ? 'border-l-4' : ''
        )}
        style={error ? { borderLeftColor: 'var(--color-danger)' } : undefined}
      >
        {/* Focus ring SVG overlay */}
        {!isReduced && dims.perimeter > 0 && (
          <svg
            ref={svgRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 1,
              borderRadius: '6px',
            }}
          >
            <rect
              ref={rectRef}
              x="1"
              y="1"
              width={dims.width > 2 ? dims.width - 2 : 0}
              height={dims.height > 2 ? dims.height - 2 : 0}
              rx="5"
              ry="5"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray={dims.perimeter}
              strokeDashoffset={dims.perimeter}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Floating label */}
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: labelFloated
              ? 'translateY(-20px) scale(0.85)'
              : 'translateY(-50%) scale(1)',
            transformOrigin: 'left center',
            color: labelFloated
              ? 'var(--color-text-secondary)'
              : 'var(--color-text-tertiary)',
            transition: isReduced ? 'none' : 'transform 200ms ease, color 200ms ease',
            pointerEvents: 'none',
            fontSize: '14px',
            fontFamily: 'var(--font-display)',
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </label>

        {/* Cloned child with focus/blur handlers */}
        <div
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {children}
        </div>
      </div>

      {error && (
        <p
          style={{
            color: 'var(--color-danger)',
            fontSize: '12px',
            marginTop: '4px',
            fontFamily: 'var(--font-display)',
          }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const isReduced = useReducedMotion();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const submitLockRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = useCallback(
    (field: keyof ContactFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
        setToast(null);
      },
    [errors]
  );

  const handleTextareaInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
    },
    []
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (submitLockRef.current || isSubmitting) return;

      const result = contactSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const newErrors: FieldErrors = {};
        if (fieldErrors.name?.[0]) newErrors.name = fieldErrors.name[0];
        if (fieldErrors.email?.[0]) newErrors.email = fieldErrors.email[0];
        if (fieldErrors.message?.[0]) newErrors.message = fieldErrors.message[0];
        setErrors(newErrors);
        return;
      }

      submitLockRef.current = true;
      setIsSubmitting(true);
      setIsButtonPressed(true);
      setErrors({});
      setToast(null);

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });

        setIsButtonPressed(false);

        if (res.ok) {
          setHasSubmitted(true);
          onSuccess();
        } else if (res.status === 429) {
          setToast('Too many signals — try again in a minute.');
        } else {
          setToast('Message failed to send. Try again?');
        }
      } catch {
        setIsButtonPressed(false);
        setToast('Message failed to send. Try again?');
      } finally {
        setIsSubmitting(false);
        submitLockRef.current = false;
      }
    },
    [formData, isSubmitting, onSuccess]
  );

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '6px',
    padding: '24px 16px 10px',
    fontSize: '14px',
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color 200ms ease',
  };

  return (
    <form
      action="/api/contact"
      method="POST"
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}
    >
      {/* Toast error */}
      {toast && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 59, 59, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-danger)',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '16px',
              lineHeight: 1,
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Name field */}
      <FloatingField
        id="contact-name"
        label="Name"
        value={formData.name}
        error={errors.name ?? undefined}
        isReduced={isReduced}
      >
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          style={{
            ...inputBaseStyle,
            borderColor: errors.name ? 'var(--color-danger)' : undefined,
          }}
        />
      </FloatingField>

      {/* Email field */}
      <FloatingField
        id="contact-email"
        label="Email"
        value={formData.email}
        error={errors.email ?? undefined}
        isReduced={isReduced}
      >
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          style={{
            ...inputBaseStyle,
            borderColor: errors.email ? 'var(--color-danger)' : undefined,
          }}
        />
      </FloatingField>

      {/* Message field */}
      <FloatingField
        id="contact-message"
        label="Message"
        value={formData.message}
        error={errors.message ?? undefined}
        isReduced={isReduced}
      >
        <textarea
          ref={textareaRef}
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange('message')}
          onInput={handleTextareaInput}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          style={{
            ...inputBaseStyle,
            minHeight: '120px',
            maxHeight: '300px',
            resize: 'vertical',
            paddingTop: '28px',
            lineHeight: '1.6',
            borderColor: errors.message ? 'var(--color-danger)' : undefined,
          }}
        />
      </FloatingField>

      {/* Submit button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{
            transform: isButtonPressed && !isReduced ? 'translateY(3px)' : 'translateY(0)',
            transition: isReduced ? 'none' : 'transform 80ms ease',
          }}
        >
          <ElectricButton
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            aria-label="Send your message"
          >
            {isSubmitting ? 'Sending…' : 'Send Signal'}
          </ElectricButton>
        </div>
      </div>
    </form>
  );
};