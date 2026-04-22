import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 py-10 dark:border-neutral-800/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 sm:flex-row">
        <p>
          <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text font-semibold text-transparent">
            APIVerse
          </span>{' '}
          — a portfolio piece by Majd.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          <Link
            href="/explore"
            className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-200 dark:focus-visible:ring-offset-neutral-950"
          >
            Explore
          </Link>
          <Link
            href="/community"
            className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-200 dark:focus-visible:ring-offset-neutral-950"
          >
            Community
          </Link>
          <a
            href="https://github.com/majdjadalhaq/apiverse"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:hover:text-neutral-200 dark:focus-visible:ring-offset-neutral-950"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
