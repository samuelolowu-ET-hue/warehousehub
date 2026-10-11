'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/shop';

  const { user, signUpWithEmail, signInWithGoogle, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(next.startsWith('/') ? next : '/shop');
    }
  }, [user, authLoading, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUpWithEmail(email, password, fullName);

      // If user session is returned immediately (email confirmation disabled or auto-confirmed)
      if (data?.session) {
        router.push(next.startsWith('/') ? next : '/shop');
        router.refresh();
        return;
      }

      // If confirmation email was dispatched by Supabase
      setSuccessMessage(
        'Account created! Please check your email for a confirmation link to activate your account.'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not create account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in could not be initiated.';
      setError(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="bg-chalk min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      style={{ paddingTop: 'calc(var(--navbar-height) + 2rem)' }}
    >
      <div className="max-w-md w-full bg-white rounded-card border border-border p-8 shadow-card">
        <div className="text-center mb-8">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">
            Join WarehouseHub
          </p>
          <h1 className="font-serif text-heading-xl text-ink">Create an Account</h1>
          <p className="text-body-sm text-fog mt-2">
            Access your order history and checkout faster
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-btn bg-red-50 border border-red-200 text-error text-body-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="mb-6 p-4 rounded-btn bg-green-50 border border-green-200 text-success text-body-sm"
            role="alert"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-label-sm font-medium text-ink mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full px-4 py-3 rounded-btn border border-border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-label-sm font-medium text-ink mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-btn border border-border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-btn border border-border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-label-sm font-medium text-ink mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-btn border border-border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-btn bg-ink text-chalk hover:bg-slate text-label-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-label-sm">
            <span className="px-3 bg-white text-fog uppercase">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full py-3 px-4 rounded-btn border border-border bg-white hover:bg-linen text-ink text-label-lg font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
        </button>

        <p className="mt-8 text-center text-body-sm text-fog">
          Already have an account?{' '}
          <Link href="/login" className="text-brass hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-chalk flex items-center justify-center text-fog text-body-md"
          style={{ paddingTop: 'var(--navbar-height)' }}
        >
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
