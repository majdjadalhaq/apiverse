import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const toggleBookmark = vi.fn()
const routerPush = vi.fn()

vi.mock('@/app/actions/bookmarks', () => ({
  toggleBookmark: (...args: unknown[]) => toggleBookmark(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: vi.fn() }),
}))

import { BookmarkButton } from '@/components/api-card/BookmarkButton'

describe('BookmarkButton', () => {
  beforeEach(() => {
    toggleBookmark.mockReset()
    routerPush.mockReset()
  })

  it('redirects guests to login with a next param', () => {
    render(
      <BookmarkButton
        apiId="a1"
        slug="cat-facts"
        initialBookmarked={false}
        isLoggedIn={false}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(routerPush).toHaveBeenCalledWith('/login?next=/api/cat-facts')
    expect(toggleBookmark).not.toHaveBeenCalled()
  })

  it('flips to Saved and calls toggleBookmark when logged in', async () => {
    toggleBookmark.mockResolvedValue({ ok: true, bookmarked: true })
    render(
      <BookmarkButton
        apiId="a1"
        slug="cat-facts"
        initialBookmarked={false}
        isLoggedIn
      />,
    )
    const btn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(btn)

    expect(btn).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => {
      expect(toggleBookmark).toHaveBeenCalledWith('a1', 'cat-facts')
    })
    expect(await screen.findByRole('button', { name: /saved/i })).toBeInTheDocument()
  })

  it('reverts the optimistic flip when the server fails', async () => {
    toggleBookmark.mockResolvedValue({ ok: false, error: 'Nope' })
    render(
      <BookmarkButton
        apiId="a1"
        slug="cat-facts"
        initialBookmarked={false}
        isLoggedIn
      />,
    )
    const btn = screen.getByRole('button', { name: /save/i })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(btn).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
