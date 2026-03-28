'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-gray-500">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUpWithEmail(email, password, name);
      if (!result.ok) {
        setError(result.error || 'Sign-up failed');
        setLoading(false);
        return;
      }
    }

    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (result.ok) {
      router.push(returnTo);
      router.refresh();
    } else {
      setError(result.error || 'Sign-in failed');
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xs font-bold">
              RE
            </span>
            <span className="font-bold text-lg text-white">Materials</span>
          </Link>
          <h1 className="text-xl font-bold">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Shared account with AI Energy Analyst
          </p>
        </div>

        {/* Google Sign-in */}
        <button
          onClick={() => signInWithGoogle(returnTo)}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black px-3 text-gray-500">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 outline-none transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-sm text-gray-500">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); }} className="text-primary-400 hover:text-primary-300">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(''); }} className="text-primary-400 hover:text-primary-300">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
