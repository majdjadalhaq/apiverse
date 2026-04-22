'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions/profile'
import { cn } from '@/lib/utils'

interface Props {
  initialUsername: string
  initialBio: string
}

export function ProfileForm({ initialUsername, initialBio }: Props) {
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    startTransition(async () => {
      const result = await updateProfile({ username, bio })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOk(true)
      router.refresh()
    })
  }

  const dirty = username !== initialUsername || bio !== initialBio

  return (
    <form onSubmit={handleSubmit} aria-label="Profile" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="profile-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={24}
          pattern="[a-z0-9_]+"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <p className="text-xs text-neutral-500">
          3–24 characters. Lowercase letters, numbers, and underscore only.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={240}
          placeholder="Say a little about yourself."
          className="resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <p className="text-xs text-neutral-500">{bio.length}/240</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {ok && (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={!dirty || isPending}
        className={cn(
          'inline-flex h-11 items-center justify-center self-start rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white transition',
          'hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
