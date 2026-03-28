'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { loginSchema } from '@/validations/admin';
import { SITE_NAME } from '@/lib/constants';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setError(firstError?.message ?? 'Invalid input.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: validation.data.email,
        password: validation.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError('Invalid email or password.');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-primary)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-default)',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {SITE_NAME}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Admin
          </h1>
        </div>

        {/* Error message */}
        {error !== null && (
          <div
            role="alert"
            style={{
              marginBottom: '24px',
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: 'var(--color-danger)',
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
              style={{
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
                opacity: isLoading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              required
              style={{
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
                opacity: isLoading ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: isLoading ? 'var(--color-accent-dim)' : 'var(--color-accent)',
              color: 'var(--color-bg-primary)',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity 150ms, background-color 150ms',
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;