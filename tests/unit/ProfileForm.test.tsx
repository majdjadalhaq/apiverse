import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const updateProfile = vi.fn()
const routerRefresh = vi.fn()

vi.mock('@/app/actions/profile', () => ({
  updateProfile: (...args: unknown[]) => updateProfile(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
}))

import { ProfileForm } from '@/components/profile/ProfileForm'

describe('ProfileForm', () => {
  beforeEach(() => {
    updateProfile.mockReset()
    routerRefresh.mockReset()
  })

  it('disables save until the form is dirty', () => {
    render(<ProfileForm initialUsername="majd" initialBio="hi" />)
    const btn = screen.getByRole('button', { name: /save changes/i })
    expect(btn).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'majd2' },
    })
    expect(btn).not.toBeDisabled()
  })

  it('submits the updated values and shows a success state', async () => {
    updateProfile.mockResolvedValue({ ok: true })
    render(<ProfileForm initialUsername="majd" initialBio="hi" />)
    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: 'new bio text' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        username: 'majd',
        bio: 'new bio text',
      })
    })
    expect(await screen.findByRole('status')).toHaveTextContent(/saved/i)
    expect(routerRefresh).toHaveBeenCalled()
  })

  it('renders the server error message', async () => {
    updateProfile.mockResolvedValue({ ok: false, error: 'Username taken' })
    render(<ProfileForm initialUsername="majd" initialBio="" />)
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'taken_one' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Username taken')
  })
})
