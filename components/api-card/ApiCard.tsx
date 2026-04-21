import Link from 'next/link'
import type { PublicApi } from '@/lib/api-data/types'

interface ApiCardProps {
  api: PublicApi
}

export function ApiCard({ api }: ApiCardProps) {
  return (
    <Link
      href={`/api/${api.slug}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-indigo-500/60"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-tight transition-colors group-hover:text-indigo-500">
          {api.name}
        </h3>
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {api.category}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
        {api.description}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {api.auth !== 'No' && (
          <Badge tone="amber">
            <KeyIcon /> {api.auth}
          </Badge>
        )}
        {api.https && <Badge tone="emerald">HTTPS</Badge>}
        {api.cors === 'Yes' && <Badge tone="indigo">CORS</Badge>}
      </div>
    </Link>
  )
}

type Tone = 'amber' | 'emerald' | 'indigo'

const toneClasses: Record<Tone, string> = {
  amber:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  emerald:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  indigo:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

function KeyIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  )
}
