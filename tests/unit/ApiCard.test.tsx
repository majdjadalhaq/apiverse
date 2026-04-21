import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ApiCard } from '@/components/api-card/ApiCard'
import type { ApiRow } from '@/lib/api-data/types'

const mockApi: ApiRow = {
  id: '1',
  name: 'Dog CEO',
  description: 'Random dog images across dozens of breeds.',
  category: 'Animals',
  url: 'https://dog.ceo/',
  auth: 'No',
  https: true,
  cors: 'Yes',
  slug: 'dog-ceo',
  created_at: '2026-04-21T00:00:00Z',
}

describe('ApiCard', () => {
  it('renders name, description, and category', () => {
    render(<ApiCard api={mockApi} />)
    expect(screen.getByText('Dog CEO')).toBeInTheDocument()
    expect(screen.getByText(/random dog images/i)).toBeInTheDocument()
    expect(screen.getByText('Animals')).toBeInTheDocument()
  })

  it('links to the API detail page by slug', () => {
    render(<ApiCard api={mockApi} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/api/dog-ceo')
  })

  it('shows HTTPS + CORS badges when applicable', () => {
    render(<ApiCard api={mockApi} />)
    expect(screen.getByText('HTTPS')).toBeInTheDocument()
    expect(screen.getByText('CORS')).toBeInTheDocument()
  })

  it('shows the auth badge only when auth is not "No"', () => {
    render(<ApiCard api={mockApi} />)
    expect(screen.queryByText(/apiKey/i)).not.toBeInTheDocument()

    const nasa: ApiRow = { ...mockApi, id: '2', auth: 'apiKey', slug: 'nasa' }
    render(<ApiCard api={nasa} />)
    expect(screen.getByText(/apiKey/i)).toBeInTheDocument()
  })
})
