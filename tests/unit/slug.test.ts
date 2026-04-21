import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/utils'

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Open Weather Map')).toBe('open-weather-map')
  })

  it('strips special characters', () => {
    expect(slugify('NASA (APOD)')).toBe('nasa-apod')
  })

  it('collapses consecutive whitespace', () => {
    expect(slugify('Cat   Facts')).toBe('cat-facts')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --hello world--  ')).toBe('hello-world')
  })

  it('is idempotent', () => {
    const slug = slugify('Dog CEO')
    expect(slugify(slug)).toBe(slug)
  })
})
