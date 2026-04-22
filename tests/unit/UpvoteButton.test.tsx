import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const toggleUpvote = vi.fn()
const routerPush = vi.fn()

vi.mock('@/app/actions/community', () => ({
  toggleUpvote: (...args: unknown[]) => toggleUpvote(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: vi.fn() }),
}))

import { UpvoteButton } from '@/components/community/UpvoteButton'

describe('UpvoteButton', () => {
  beforeEach(() => {
    toggleUpvote.mockReset()
    routerPush.mockReset()
  })

  it('redirects guests to login', () => {
    render(
      <UpvoteButton
        demoId="d1"
        slug="cat-facts"
        initialCount={3}
        initialUpvoted={false}
        isLoggedIn={false}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(routerPush).toHaveBeenCalledWith('/login?next=/api/cat-facts')
    expect(toggleUpvote).not.toHaveBeenCalled()
  })

  it('optimistically increments when logged in', async () => {
    toggleUpvote.mockResolvedValue({ ok: true, data: { upvoted: true, count: 4 } })
    render(
      <UpvoteButton
        demoId="d1"
        slug="cat-facts"
        initialCount={3}
        initialUpvoted={false}
        isLoggedIn
      />,
    )

    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveTextContent('4')
    await waitFor(() => expect(toggleUpvote).toHaveBeenCalledWith('d1', 'cat-facts'))
  })

  it('reverts optimistic change on server error', async () => {
    toggleUpvote.mockResolvedValue({ ok: false, error: 'Nope' })
    render(
      <UpvoteButton
        demoId="d1"
        slug="cat-facts"
        initialCount={5}
        initialUpvoted
        isLoggedIn
      />,
    )

    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    // optimistic: count=4, upvoted=false
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn).toHaveTextContent('4')

    await waitFor(() => {
      expect(btn).toHaveAttribute('aria-pressed', 'true')
      expect(btn).toHaveTextContent('5')
    })
  })
})
