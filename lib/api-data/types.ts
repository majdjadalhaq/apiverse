export type ApiAuth = 'apiKey' | 'OAuth' | 'No' | 'X-Mashape-Key' | 'User-Agent'
export type ApiCors = 'Yes' | 'No' | 'Unknown'

/**
 * Shape of a row in the `apis` table, mirrored in TS so we have a single
 * source of truth for the seed file and UI components.
 */
export interface PublicApi {
  name: string
  description: string
  category: string
  url: string
  auth: ApiAuth
  https: boolean
  cors: ApiCors
  slug: string
}

/**
 * Row that comes back from Supabase — same shape as PublicApi plus the
 * generated id + timestamp columns.
 */
export interface ApiRow extends PublicApi {
  id: string
  created_at: string
}
