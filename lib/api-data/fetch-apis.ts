import { createClient } from '@/lib/supabase/server'
import { PUBLIC_APIS } from './apis'
import type { PublicApi } from './types'

/**
 * Fetch the API catalog from Supabase, falling back to the in-repo seed
 * list if the DB hasn't been populated yet (or the query errors).
 *
 * This keeps local dev frictionless: clone, `npm run dev`, browse APIs
 * without running migrations or the seed route first.
 */
export async function fetchApis(): Promise<PublicApi[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('apis').select('*').order('name')
    if (!error && data && data.length > 0) {
      return data as PublicApi[]
    }
  } catch {
    // Supabase client could throw if env vars aren't wired — fall through.
  }
  return [...PUBLIC_APIS].sort((a, b) => a.name.localeCompare(b.name))
}
