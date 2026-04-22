'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    n: '01',
    title: 'Find an API',
    body: 'Hit /explore, search by keyword or filter by category. Cards show auth, HTTPS, and CORS status at a glance.',
  },
  {
    n: '02',
    title: 'Run a live demo',
    body: 'Open any supported API, tweak the inputs, and click Run. The sandboxed iframe hits the endpoint and streams the JSON back.',
  },
  {
    n: '03',
    title: 'Save or share',
    body: 'Bookmark it for later, drop it into a collection, or share your own demo with the community and rack up upvotes.',
  },
]

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mb-14 flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-indigo-500">
          How it works
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          From idea to working call in three steps
        </h2>
      </div>

      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.li
            key={step.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-indigo-50/40 p-6 dark:border-neutral-800 dark:from-neutral-900/40 dark:to-indigo-950/20"
          >
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-4 bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 bg-clip-text text-7xl font-black leading-none text-transparent"
            >
              {step.n}
            </span>
            <h3 className="relative text-lg font-semibold">{step.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {step.body}
            </p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
