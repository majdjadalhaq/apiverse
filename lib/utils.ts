import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge className strings, letting later Tailwind utilities override earlier
 * ones. Use this instead of template-string concatenation so `cn(base, 'p-8')`
 * actually beats a `p-4` in `base`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert an API name into a URL-safe slug. Keeps the result stable across
 * seed runs so we don't generate duplicate rows when names are reformatted.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
