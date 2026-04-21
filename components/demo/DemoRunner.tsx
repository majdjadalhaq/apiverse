'use client'

import { useEffect, useRef, useState } from 'react'
import {
  isSandboxOutbound,
  sendToSandbox,
  type SandboxOutboundMessage,
} from '@/lib/demo-sandbox/messages'

interface DemoRunnerProps {
  demoKey: string
  params?: Record<string, string>
  height?: number
  className?: string
}

type Status = 'loading' | 'running' | 'done' | 'error'

/**
 * Renders a `<iframe sandbox>` that hosts a registered demo from
 * `/public/sandbox/runner.html`. The host and sandbox talk over
 * `postMessage` using the typed contract in `lib/demo-sandbox/messages.ts`.
 *
 * Re-mount via React `key` (e.g. a run counter) to force a fresh sandbox
 * load — this is how the detail page's "Run" button retriggers demos.
 */
export function DemoRunner({
  demoKey,
  params = {},
  height = 320,
  className,
}: DemoRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (!isSandboxOutbound(event.data)) return
      const msg: SandboxOutboundMessage = event.data

      if (msg.type === 'DEMO_READY') {
        if (!iframeRef.current) return
        setStatus('running')
        setError(null)
        sendToSandbox(iframeRef.current, { type: 'RENDER_DEMO', demoKey, params })
        return
      }
      if (msg.type === 'DEMO_RESULT') {
        setStatus('done')
        return
      }
      if (msg.type === 'DEMO_ERROR') {
        setStatus('error')
        setError(msg.message)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [demoKey, params])

  return (
    <div
      className={
        'relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 ' +
        (className ?? '')
      }
    >
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          Initializing sandbox…
        </div>
      )}
      {status === 'error' && error && (
        <div className="absolute inset-x-0 top-0 z-10 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/sandbox/runner.html"
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', height, border: 'none', background: 'transparent' }}
        title={`${demoKey} demo sandbox`}
      />
    </div>
  )
}
