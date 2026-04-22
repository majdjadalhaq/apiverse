import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const createCollection = vi.fn()
const routerRefresh = vi.fn()

vi.mock('@/app/actions/collections', () => ({
  createCollection: (...args: unknown[]) => createCollection(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, push: vi.fn() }),
}))

import { NewCollectionForm } from '@/components/collections/NewCollectionForm'

describe('NewCollectionForm', () => {
  beforeEach(() => {
    createCollection.mockReset()
    routerRefresh.mockReset()
  })

  it('renders the name and description inputs with labels', () => {
    render(<NewCollectionForm />)
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create collection/i })).toBeInTheDocument()
  })

  it('calls createCollection with trimmed name + description and refreshes', async () => {
    createCollection.mockResolvedValue({ ok: true, data: { id: 'c1' } })
    render(<NewCollectionForm />)
    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: '  Weekend APIs  ' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Side-project material' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create collection/i }))

    await waitFor(() => {
      expect(createCollection).toHaveBeenCalledWith(
        'Weekend APIs',
        'Side-project material',
      )
      expect(routerRefresh).toHaveBeenCalled()
    })
  })

  it('surfaces a server-side error message', async () => {
    createCollection.mockResolvedValue({ ok: false, error: 'Database down' })
    render(<NewCollectionForm />)
    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: 'Something' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create collection/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Database down')
    expect(routerRefresh).not.toHaveBeenCalled()
  })
})
