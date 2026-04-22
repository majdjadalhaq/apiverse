import Link from 'next/link'

/**
 * App-shell layout for everything that isn't auth. Nav bar stays minimal
 * for now — the full hero + GSAP polish lands in a later PR.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-neutral-950 dark:via-indigo-950/10 dark:to-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/70">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
        >
          <Link
            href="/"
            className="rounded font-semibold tracking-tight text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
          >
            <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              APIVerse
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-neutral-600 dark:text-neutral-400">
            <Link
              href="/explore"
              className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
            >
              Explore
            </Link>
            <Link
              href="/community"
              className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
            >
              Community
            </Link>
            <Link
              href="/collections"
              className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
            >
              Collections
            </Link>
            <Link
              href="/login"
              className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  )
}
