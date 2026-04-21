import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`)
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser },
  }),
}))

vi.mock('next/navigation', () => ({ redirect }))

describe('requireAuth', () => {
  beforeEach(() => {
    getUser.mockReset()
    redirect.mockClear()
  })

  it('redirects to /login when no user', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const { requireAuth } = await import('@/lib/auth')
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('returns user when signed in', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.c' }
    getUser.mockResolvedValue({ data: { user: fakeUser } })
    const { requireAuth } = await import('@/lib/auth')
    await expect(requireAuth()).resolves.toEqual(fakeUser)
    expect(redirect).not.toHaveBeenCalled()
  })
})
