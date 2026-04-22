'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Public APIs', value: '29+' },
  { label: 'Live sandboxed demos', value: '8' },
  { label: 'Categories', value: '12' },
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <BackdropGlow />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-5 text-xs uppercase tracking-[0.35em] text-neutral-500"
        >
          A browser-first playground for public APIs
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-7xl"
        >
          Every public API,
          <br />
          one keystroke away.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="mt-6 max-w-xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400"
        >
          Search hundreds of free endpoints. Fire them up in a sandboxed iframe.
          Bookmark your favourites, curate collections, and swap demos with the
          community — without leaving the browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/explore"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white outline-none transition hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-offset-neutral-950"
          >
            Explore the catalog
            <ArrowRightIcon />
          </Link>
          <Link
            href="/community"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-neutral-300 px-6 text-sm font-semibold text-neutral-700 outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:focus-visible:ring-offset-neutral-950"
          >
            See community demos
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
          className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-neutral-200 bg-white/50 px-3 py-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/40"
            >
              <dt className="text-xs text-neutral-500">{stat.label}</dt>
              <dd className="mt-1 bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-2xl font-bold tabular-nums text-transparent">
                {stat.value}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}

function BackdropGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/30 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite] dark:bg-indigo-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[24rem] w-[24rem] translate-x-1/3 -translate-y-1/2 rounded-full bg-fuchsia-400/30 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite] dark:bg-fuchsia-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 -z-10 h-[22rem] w-[22rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-rose-300/25 blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite] dark:bg-rose-500/15"
      />
    </>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
