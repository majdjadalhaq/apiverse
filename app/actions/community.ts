'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

const TITLE_MAX = 120
const DESC_MAX = 1000
const COMMENT_MAX = 600

export async function submitDemo(input: {
  apiId: string
  slug: string
  title: string
  description?: string
}): Promise<ActionResult<{ id: string }>> {
  const title = input.title.trim()
  const description = input.description?.trim() || null
  if (!title) return { ok: false, error: 'Title is required' }
  if (title.length > TITLE_MAX) return { ok: false, error: 'Title is too long' }
  if (description && description.length > DESC_MAX)
    return { ok: false, error: 'Description is too long' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('demos')
    .insert({
      api_id: input.apiId,
      author_id: user.id,
      title,
      description,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/api/${input.slug}`)
  revalidatePath('/community')
  return { ok: true, data: { id: data.id } }
}

export async function deleteDemo(demoId: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('demos').delete().eq('id', demoId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/api/${slug}`)
  revalidatePath('/community')
  return { ok: true }
}

export async function toggleUpvote(
  demoId: string,
  slug: string,
): Promise<ActionResult<{ upvoted: boolean; count: number }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('upvotes')
    .select('demo_id')
    .eq('user_id', user.id)
    .eq('demo_id', demoId)
    .maybeSingle()

  let upvoted: boolean
  if (existing) {
    const { error } = await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', user.id)
      .eq('demo_id', demoId)
    if (error) return { ok: false, error: error.message }
    await supabase.rpc('decrement_upvotes', { target_demo_id: demoId })
    upvoted = false
  } else {
    const { error } = await supabase
      .from('upvotes')
      .insert({ user_id: user.id, demo_id: demoId })
    if (error) return { ok: false, error: error.message }
    await supabase.rpc('increment_upvotes', { target_demo_id: demoId })
    upvoted = true
  }

  const { data: fresh } = await supabase
    .from('demos')
    .select('upvotes_count')
    .eq('id', demoId)
    .maybeSingle<{ upvotes_count: number }>()

  revalidatePath(`/api/${slug}`)
  revalidatePath('/community')
  return { ok: true, data: { upvoted, count: fresh?.upvotes_count ?? 0 } }
}

export async function postComment(input: {
  demoId: string
  slug: string
  content: string
}): Promise<ActionResult<{ id: string }>> {
  const content = input.content.trim()
  if (!content) return { ok: false, error: 'Comment cannot be empty' }
  if (content.length > COMMENT_MAX)
    return { ok: false, error: 'Comment is too long' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      demo_id: input.demoId,
      author_id: user.id,
      content,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/api/${input.slug}`)
  return { ok: true, data: { id: data.id } }
}

export async function deleteComment(
  commentId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/api/${slug}`)
  return { ok: true }
}
