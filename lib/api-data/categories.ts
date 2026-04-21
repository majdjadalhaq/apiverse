import { PUBLIC_APIS } from './apis'

/**
 * Unique category list, sorted. Recomputed at build time so adding APIs to
 * `apis.ts` automatically surfaces their category in the filter UI.
 */
export const CATEGORIES = [...new Set(PUBLIC_APIS.map((api) => api.category))].sort()

export function countByCategory(): Record<string, number> {
  return PUBLIC_APIS.reduce<Record<string, number>>((acc, api) => {
    acc[api.category] = (acc[api.category] ?? 0) + 1
    return acc
  }, {})
}
