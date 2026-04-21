import Link from 'next/link'

/**
 * Placeholder landing. The full hero + GSAP reveal + R3F canvas lands
 * in a later PR — keeping this lean so the app shell, nav, and Explore
 * page can ship first.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">
        a portfolio piece · in flight
      </p>
      <h1 className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl">
        Every public API,
        <br />
        one keystroke away.
      </h1>
      <p className="mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
        Browse, search, and run live sandboxed demos of hundreds of public
        APIs. Bookmark your favourites. Build faster.
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href="/explore"
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Explore the catalog →
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
