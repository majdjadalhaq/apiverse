/**
 * postMessage contract between the host app and the sandboxed runner iframe.
 *
 * Host → Sandbox: `SandboxInboundMessage`
 * Sandbox → Host: `SandboxOutboundMessage`
 *
 * Keep this file dependency-free — it's imported on both sides of the
 * boundary, so the runner html inlines the same shape in plain JS.
 */
export type SandboxInboundMessage = {
  type: 'RENDER_DEMO'
  demoKey: string
  params: Record<string, string>
}

export type SandboxOutboundMessage =
  | { type: 'DEMO_READY' }
  | { type: 'DEMO_RESULT'; data: unknown }
  | { type: 'DEMO_ERROR'; message: string }

export function sendToSandbox(iframe: HTMLIFrameElement, message: SandboxInboundMessage): void {
  iframe.contentWindow?.postMessage(message, '*')
}

export function isSandboxOutbound(value: unknown): value is SandboxOutboundMessage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { type?: unknown }
  return v.type === 'DEMO_READY' || v.type === 'DEMO_RESULT' || v.type === 'DEMO_ERROR'
}
