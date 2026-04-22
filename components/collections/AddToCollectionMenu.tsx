'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addApiToCollection, createCollection } from '@/app/actions/collections'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  hasApi: boolean
}

interface Props {
  apiId: string
  slug: string
  collections: Collection[]
  isLoggedIn: boolean
}

export function AddToCollectionMenu({ apiId, slug, collections, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function toggle() {
    if (!isLoggedIn) {
      router.push(`/login?next=/api/${slug}`)
      return
    }
    setOpen((v) => !v)
    setStatus(null)
  }

  function addTo(collectionId: string, name: string, alreadyIn: boolean) {
    if (alreadyIn) {
      setStatus(`Already in "${name}"`)
      return
    }
    startTransition(async () => {
      const result = await addApiToCollection(collectionId, apiId)
      if (!result.ok) {
        setStatus(result.error)
        return
      }
      setStatus(`Added to "${name}"`)
      router.refresh()
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    startTransition(async () => {
      const created = await createCollection(trimmed)
      if (!created.ok || !created.data) {
        setStatus(created.ok ? 'Unexpected error' : created.error)
        return
      }
      const added = await addApiToCollection(created.data.id, apiId)
      if (!added.ok) {
        setStatus(added.error)
        return
      }
      setStatus(`Created and added to "${trimmed}"`)
      setNewName('')
      router.refresh()
    })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-sm font-medium transition',
          'hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-offset-neutral-950',
        )}
      >
        <PlusIcon />
        Add to collection
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {collections.length > 0 ? (
            <ul className="max-h-56 overflow-y-auto py-1">
              {collections.map((c) => (
                <li key={c.id}>
                  <button
                    role="menuitem"
                    type="button"
                    disabled={isPending}
                    onClick={() => addTo(c.id, c.name, c.hasApi)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
                  >
                    <span className="truncate">{c.name}</span>
                    {c.hasApi && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        ✓ in
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-neutral-500">
              No collections yet — create your first one below.
            </p>
          )}

          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800"
          >
            <label htmlFor="new-collection" className="sr-only">
              New collection name
            </label>
            <input
              id="new-collection"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={80}
              placeholder="New collection name"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <button
              type="submit"
              disabled={isPending || !newName.trim()}
              className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-neutral-950"
            >
              Create and add
            </button>
          </form>

          {status && (
            <p
              role="status"
              className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
            >
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}
