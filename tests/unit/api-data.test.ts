import { describe, it, expect } from 'vitest'
import { PUBLIC_APIS } from '@/lib/api-data/apis'
import { CATEGORIES, countByCategory } from '@/lib/api-data/categories'

describe('api-data', () => {
  it('has at least 25 curated APIs', () => {
    expect(PUBLIC_APIS.length).toBeGreaterThanOrEqual(25)
  })

  it('every slug is unique', () => {
    const slugs = PUBLIC_APIS.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every api has required fields', () => {
    for (const api of PUBLIC_APIS) {
      expect(api.name).toBeTruthy()
      expect(api.description).toBeTruthy()
      expect(api.category).toBeTruthy()
      expect(api.url).toMatch(/^https?:\/\//)
      expect(api.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('CATEGORIES is sorted and unique', () => {
    const sorted = [...CATEGORIES].sort()
    expect(CATEGORIES).toEqual(sorted)
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length)
  })

  it('countByCategory totals match PUBLIC_APIS length', () => {
    const counts = countByCategory()
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    expect(total).toBe(PUBLIC_APIS.length)
  })
})
