'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitDemo } from '@/app/actions/community'
import { cn } from '@/lib/utils'

interface Props {
  apiId: string
  slug: string
  isLoggedIn: boolean
}

export function SubmitDemoForm({ apiId, slug, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        <a
          href={`/login?next=/api/${slug}`}
          className="text-indigo-500 underline-offset-2 hover:underline"
        >
          Sign in
        </a>{' '}
        to share your own demo or idea for this API.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-11 items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-5 text-sm font-semibold text-indigo-700 outline-none transition',
          'hover:border-indigo-400 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60 dark:focus-visible:ring-offset-neutral-950',
        )}
      >
        + Share a demo
      </button>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await submitDemo({ apiId, slug, title, description })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setTitle('')
      setDescription('')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Submit a demo"
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="demo-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="demo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="e.g. Pull a random cat fact into a React hook"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="demo-description" className="text-sm font-medium">
          Description{' '}
          <span className="text-xs font-normal text-neutral-500">(optional)</span>
        </label>
        <textarea
          id="demo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Briefly explain what your demo shows, or link to a gist / CodeSandbox."
          className="resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white transition',
            'hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
            'disabled:cursor-wait disabled:opacity-60',
          )}
        >
          {isPending ? 'Submitting…' : 'Submit demo'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-neutral-600 outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:ring-offset-neutral-950"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
