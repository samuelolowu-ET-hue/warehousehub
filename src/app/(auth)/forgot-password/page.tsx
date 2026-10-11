'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not send reset link. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
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
            Account Recovery
          </p>
          <h1 className="font-serif text-heading-xl text-ink">Reset Password</h1>
          <p className="text-body-sm text-fog mt-2">
            Enter your email and we’ll send a link to reset your password.
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

        {submitted ? (
          <div className="text-center space-y-5">
            <div className="p-4 rounded-btn bg-green-50 border border-green-200 text-success text-body-sm">
              If an account exists with <strong className="font-medium text-ink">{email}</strong>,
              we have sent a password reset link. Please check your inbox and spam folder.
            </div>
            <Link
              href="/login"
              className="inline-block py-3 px-6 rounded-btn bg-ink text-chalk hover:bg-slate text-label-lg font-medium transition-colors"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-btn bg-ink text-chalk hover:bg-slate text-label-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Sending link…' : 'Send reset link'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-body-sm text-brass hover:underline font-medium">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
