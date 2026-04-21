export function ApiCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full animate-pulse flex-col gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="mt-auto flex gap-2 pt-1">
        <div className="h-5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
