'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<'github' | 'google' | null>(null)
  const error = searchParams.get('error')

  async function signIn(provider: 'github' | 'google') {
    setLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-6 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.25),transparent_50%)]"
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
        <Link
          href="/"
          className="text-center text-xs uppercase tracking-[0.3em] text-neutral-500 transition-colors hover:text-neutral-300"
        >
          apiverse
        </Link>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-neutral-400">Sign in to save APIs and share demos.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
            Sign-in failed. Try again.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <ProviderButton
            provider="github"
            loading={loading === 'github'}
            onClick={() => signIn('github')}
          />
          <ProviderButton
            provider="google"
            loading={loading === 'google'}
            onClick={() => signIn('google')}
          />
        </div>

        <p className="text-center text-xs text-neutral-500">
          By continuing you agree to be nice to the APIs.
        </p>
      </div>
    </main>
  )
}

function ProviderButton({
  provider,
  loading,
  onClick,
}: {
  provider: 'github' | 'google'
  loading: boolean
  onClick: () => void
}) {
  const label = provider === 'github' ? 'Continue with GitHub' : 'Continue with Google'
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'group flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium backdrop-blur transition-all',
        'hover:border-white/30 hover:bg-white/10',
        'disabled:cursor-wait disabled:opacity-60',
      )}
    >
      {provider === 'github' ? <GithubGlyph /> : <GoogleGlyph />}
      <span>{loading ? 'Redirecting…' : label}</span>
    </button>
  )
}

function GithubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.02c-3.34.72-4.04-1.61-4.04-1.61-.54-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.13-.3-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23.96-.27 1.99-.4 3.01-.41 1.02.01 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.89.12 3.19.77.84 1.24 1.92 1.24 3.24 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  )
}
