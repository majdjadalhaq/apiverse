'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDemo } from '@/app/actions/community'
import { UpvoteButton } from './UpvoteButton'
import { CommentsThread, type CommentRow } from './CommentsThread'
import { cn } from '@/lib/utils'

export interface DemoRow {
  id: string
  title: string
  description: string | null
  author_id: string | null
  author_name: string | null
  is_official: boolean
  upvotes_count: number
  created_at: string
  hasUpvoted: boolean
  comments: CommentRow[]
}

interface Props {
  demo: DemoRow
  slug: string
  currentUserId: string | null
}

export function DemoCard({ demo, slug, currentUserId }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isLoggedIn = !!currentUserId
  const isAuthor = currentUserId === demo.author_id

  function handleDelete() {
    const ok = window.confirm('Delete this demo? This cannot be undone.')
    if (!ok) return
    startTransition(async () => {
      const result = await deleteDemo(demo.id, slug)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="flex items-start gap-4">
        <UpvoteButton
          demoId={demo.id}
          slug={slug}
          initialCount={demo.upvotes_count}
          initialUpvoted={demo.hasUpvoted}
          isLoggedIn={isLoggedIn}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{demo.title}</h3>
            {demo.is_official && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Official
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {demo.author_name ?? 'Anonymous'} · {formatDate(demo.created_at)}
          </p>
          {demo.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
              {demo.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setCommentsOpen((v) => !v)}
              aria-expanded={commentsOpen}
              className="rounded text-neutral-500 outline-none transition hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-200 dark:focus-visible:ring-offset-neutral-950"
            >
              {commentsOpen ? 'Hide' : 'Show'} comments ({demo.comments.length})
            </button>
            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className={cn(
                  'rounded text-rose-500 outline-none transition hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
                  isPending && 'cursor-wait opacity-60',
                )}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {commentsOpen && (
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <CommentsThread
            demoId={demo.id}
            slug={slug}
            comments={demo.comments}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </article>
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
