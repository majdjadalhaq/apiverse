'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BookmarkResult =
  | { ok: true; bookmarked: boolean }
  | { ok: false; error: string }

/**
 * Flip the bookmark on/off for the signed-in user. Returns the resulting
 * state so the caller can reconcile its optimistic update on error.
 *
 * Route path is passed in (not inferred) because server actions don't
 * know which page triggered them — we revalidate exactly the detail
 * page that was showing the button.
 */
export async function toggleBookmark(apiId: string, slug: string): Promise<BookmarkResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('api_id', apiId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/api/${slug}`)
    return { ok: true, bookmarked: false }
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, api_id: apiId })

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/api/${slug}`)
  return { ok: true, bookmarked: true }
}
