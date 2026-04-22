'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { postComment, deleteComment } from '@/app/actions/community'
import { cn } from '@/lib/utils'

export interface CommentRow {
  id: string
  content: string
  created_at: string
  author_id: string
  author_name: string | null
}

interface Props {
  demoId: string
  slug: string
  comments: CommentRow[]
  currentUserId: string | null
}

export function CommentsThread({ demoId, slug, comments, currentUserId }: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isLoggedIn = !!currentUserId

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!draft.trim()) return
    startTransition(async () => {
      const result = await postComment({ demoId, slug, content: draft })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDraft('')
      router.refresh()
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId, slug)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {comments.length === 0 && (
          <li className="text-sm text-neutral-500">No comments yet.</li>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-neutral-200 bg-white/60 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/40"
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {c.author_name ?? 'Anonymous'}
              </span>
              <span>{formatDate(c.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
              {c.content}
            </p>
            {currentUserId === c.author_id && (
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                disabled={isPending}
                className="mt-2 text-xs text-rose-500 underline-offset-2 outline-none transition hover:underline focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} aria-label="Post a comment" className="flex flex-col gap-2">
          <label htmlFor={`comment-${demoId}`} className="sr-only">
            Your comment
          </label>
          <textarea
            id={`comment-${demoId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="Add a reply…"
            className="resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950"
          />
          {error && (
            <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !draft.trim()}
            className={cn(
              'inline-flex h-9 w-fit items-center justify-center self-end rounded-full bg-indigo-500 px-4 text-xs font-semibold text-white transition',
              'hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isPending ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-neutral-500">
          <a
            href={`/login?next=/api/${slug}`}
            className="text-indigo-500 underline-offset-2 hover:underline"
          >
            Sign in
          </a>{' '}
          to join the conversation.
        </p>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
