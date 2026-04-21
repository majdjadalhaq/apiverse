'use client'

import { useState } from 'react'
import { DemoRunner } from './DemoRunner'
import type { ParamDef } from '@/lib/demo-sandbox/demo-configs'

interface DemoControlsProps {
  demoKey: string
  paramDefs?: ParamDef[]
  height?: number
}

/**
 * Wraps a `DemoRunner` with optional parameter inputs. Clicking "Run"
 * bumps an internal counter used as the runner's `key`, forcing a
 * fresh iframe mount so every run hits a clean sandbox.
 */
export function DemoControls({ demoKey, paramDefs = [], height }: DemoControlsProps) {
  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(paramDefs.map((p) => [p.key, p.defaultValue ?? ''])),
  )
  const [runKey, setRunKey] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {paramDefs.length > 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setRunKey((k) => k + 1)
          }}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white/60 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          {paramDefs.map((def) => (
            <label key={def.key} className="flex min-w-[10rem] flex-1 flex-col gap-1.5 text-xs">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                {def.label}
              </span>
              <input
                type="text"
                value={params[def.key] ?? ''}
                placeholder={def.placeholder}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, [def.key]: e.target.value }))
                }
                className="rounded-lg border border-neutral-200 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700"
              />
            </label>
          ))}
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Run demo
          </button>
        </form>
      )}

      <DemoRunner key={runKey} demoKey={demoKey} params={params} height={height} />
    </div>
  )
}
