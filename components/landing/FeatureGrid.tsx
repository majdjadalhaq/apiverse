'use client'

import { motion } from 'framer-motion'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

const features: Feature[] = [
  {
    title: 'Search everything, instantly',
    description:
      'Live-filter the catalog by name, description, auth requirement, or category. No dropdowns, no roundtrips — just results as you type.',
    icon: <SearchIcon />,
  },
  {
    title: 'Run demos in a sandbox',
    description:
      'Every live demo fires inside an allowlisted iframe with postMessage IO. Tweak parameters, hit Run, and see the raw response — no setup, no CORS tears.',
    icon: <PlayIcon />,
  },
  {
    title: 'Collect, curate, share',
    description:
      'Bookmark the APIs you want to come back to. Group them into collections by project. Upvote and comment on community demos.',
    icon: <StackIcon />,
  },
]

export function FeatureGrid() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-500">
          What you get
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Three things worth the tab
        </h2>
        <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
          Built for the moment you think &ldquo;there has to be an API for that&rdquo; — and
          want an answer in under thirty seconds.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.li
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.08 }}
            className="group relative flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white/60 p-6 backdrop-blur-sm transition hover:border-indigo-400 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-indigo-500/60"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
              {f.icon}
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {f.description}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </svg>
  )
}
