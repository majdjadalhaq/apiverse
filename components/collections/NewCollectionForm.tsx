'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCollection } from '@/app/actions/collections'
import { cn } from '@/lib/utils'

export function NewCollectionForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }

    startTransition(async () => {
      const result = await createCollection(trimmed, description)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setName('')
      setDescription('')
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Create collection"
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="collection-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="collection-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          placeholder="e.g. Weekend side-project picks"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="collection-description" className="text-sm font-medium">
          Description{' '}
          <span className="text-xs font-normal text-neutral-500">(optional)</span>
        </label>
        <textarea
          id="collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={240}
          placeholder="What ties these APIs together?"
          className="resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'mt-1 inline-flex h-11 items-center justify-center self-start rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white transition',
          'hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
          'disabled:cursor-wait disabled:opacity-60',
        )}
      >
        {isPending ? 'Creating…' : 'Create collection'}
      </button>
    </form>
  )
}
