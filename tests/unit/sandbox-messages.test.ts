import { describe, it, expect, vi } from 'vitest'
import { isSandboxOutbound, sendToSandbox } from '@/lib/demo-sandbox/messages'

describe('sendToSandbox', () => {
  it('posts a RENDER_DEMO message to the iframe contentWindow', () => {
    const postMessage = vi.fn()
    const iframe = { contentWindow: { postMessage } } as unknown as HTMLIFrameElement

    sendToSandbox(iframe, { type: 'RENDER_DEMO', demoKey: 'dog', params: {} })

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'RENDER_DEMO', demoKey: 'dog', params: {} },
      '*',
    )
  })

  it('forwards params unchanged', () => {
    const postMessage = vi.fn()
    const iframe = { contentWindow: { postMessage } } as unknown as HTMLIFrameElement

    sendToSandbox(iframe, {
      type: 'RENDER_DEMO',
      demoKey: 'trivia',
      params: { category: '9' },
    })

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'RENDER_DEMO', demoKey: 'trivia', params: { category: '9' } },
      '*',
    )
  })

  it('does not throw when contentWindow is null', () => {
    const iframe = { contentWindow: null } as unknown as HTMLIFrameElement
    expect(() =>
      sendToSandbox(iframe, { type: 'RENDER_DEMO', demoKey: 'x', params: {} }),
    ).not.toThrow()
  })
})

describe('isSandboxOutbound', () => {
  it('accepts all three outbound variants', () => {
    expect(isSandboxOutbound({ type: 'DEMO_READY' })).toBe(true)
    expect(isSandboxOutbound({ type: 'DEMO_RESULT', data: 42 })).toBe(true)
    expect(isSandboxOutbound({ type: 'DEMO_ERROR', message: 'nope' })).toBe(true)
  })

  it('rejects random objects and primitives', () => {
    expect(isSandboxOutbound(null)).toBe(false)
    expect(isSandboxOutbound('DEMO_READY')).toBe(false)
    expect(isSandboxOutbound({ type: 'EVIL' })).toBe(false)
    expect(isSandboxOutbound({})).toBe(false)
  })
})
