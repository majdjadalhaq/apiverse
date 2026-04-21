import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user from the request cookies. Returns null when nobody is
 * signed in — use this in Server Components that render differently for guests.
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Server-side gate for protected routes. Redirects to `/login` when there is
 * no session, otherwise returns the user. Use at the top of any page that
 * should not be reachable by guests.
 */
export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}
