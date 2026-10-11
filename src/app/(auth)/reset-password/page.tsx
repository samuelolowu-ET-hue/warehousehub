'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please provide a new password.');
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
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/shop');
      }, 2500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not update password. Your reset link may have expired.';
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
            Security
          </p>
          <h1 className="font-serif text-heading-xl text-ink">Set New Password</h1>
          <p className="text-body-sm text-fog mt-2">Please enter your new password below.</p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-btn bg-red-50 border border-red-200 text-error text-body-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-5">
            <div className="p-4 rounded-btn bg-green-50 border border-green-200 text-success text-body-sm">
              Your password has been successfully updated! Redirecting to shop…
            </div>
            <Link
              href="/shop"
              className="inline-block py-3 px-6 rounded-btn bg-ink text-chalk hover:bg-slate text-label-lg font-medium transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="password" className="block text-label-sm font-medium text-ink mb-1.5">
                New password
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
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-btn border border-border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-btn bg-ink text-chalk hover:bg-slate text-label-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? 'Updating…' : 'Update password'}
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
