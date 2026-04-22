'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function CallToAction() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-24 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 p-10 text-white shadow-[0_32px_64px_-24px] shadow-indigo-500/40 sm:p-14"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]"
        />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to skip the docs and start calling?
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Dive into the catalog and fire your first demo in under a minute.
              No keys required for most.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-900 outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500"
          >
            Open the catalog
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
