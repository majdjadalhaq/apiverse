import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Reads/writes session cookies so auth state stays in sync.
 *
 * NOTE: Next.js 15+ made `cookies()` async. We await it here so callers don't
 * have to think about that detail.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Server Components can't mutate cookies — that's fine, the
          // middleware handles session refresh. We swallow the error here
          // because it only fires in a read-only context.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component. Safe to ignore.
          }
        },
      },
    },
  )
}
