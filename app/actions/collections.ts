'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function createCollection(
  name: string,
  description?: string,
): Promise<ActionResult<{ id: string }>> {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Name is required' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: user.id, name: trimmed, description: description?.trim() || null })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath('/collections')
  return { ok: true, data: { id: data.id } }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/collections')
  return { ok: true }
}

export async function addApiToCollection(
  collectionId: string,
  apiId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('collection_apis')
    .insert({ collection_id: collectionId, api_id: apiId })

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/collections/${collectionId}`)
  return { ok: true }
}

export async function removeApiFromCollection(
  collectionId: string,
  apiId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('collection_apis')
    .delete()
    .eq('collection_id', collectionId)
    .eq('api_id', apiId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/collections/${collectionId}`)
  return { ok: true }
}
