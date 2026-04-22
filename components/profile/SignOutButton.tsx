'use client'

import { useTransition } from 'react'
import { signOut } from '@/app/actions/profile'
import { cn } from '@/lib/utils'

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-700 outline-none transition',
        'hover:border-rose-400 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
        'dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-900/80 dark:hover:text-rose-400 dark:focus-visible:ring-offset-neutral-950',
        'disabled:cursor-wait disabled:opacity-60',
      )}
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
