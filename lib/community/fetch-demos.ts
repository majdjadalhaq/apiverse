import { createClient } from '@/lib/supabase/server'
import type { DemoRow } from '@/components/community/DemoCard'
import type { CommentRow } from '@/components/community/CommentsThread'

interface RawDemo {
  id: string
  title: string
  description: string | null
  author_id: string | null
  is_official: boolean
  upvotes_count: number
  created_at: string
  author: { username: string | null } | null
}

interface RawComment {
  id: string
  content: string
  created_at: string
  author_id: string
  demo_id: string
  author: { username: string | null } | null
}

/**
 * Fetch every demo attached to an API with its comments and the current
 * user's upvote state. Does two round trips: demos first (we need the ids),
 * then comments + upvotes in parallel.
 */
export async function fetchDemosForApi(
  apiId: string,
  currentUserId: string | null,
): Promise<DemoRow[]> {
  const supabase = await createClient()

  const { data: demos } = await supabase
    .from('demos')
    .select(
      'id, title, description, author_id, is_official, upvotes_count, created_at, author:profiles(username)',
    )
    .eq('api_id', apiId)
    .order('upvotes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<RawDemo[]>()

  if (!demos || demos.length === 0) return []

  const demoIds = demos.map((d) => d.id)

  const [commentsRes, upvotesRes] = await Promise.all([
    supabase
      .from('comments')
      .select(
        'id, content, created_at, author_id, demo_id, author:profiles(username)',
      )
      .in('demo_id', demoIds)
      .order('created_at', { ascending: true })
      .returns<RawComment[]>(),
    currentUserId
      ? supabase
          .from('upvotes')
          .select('demo_id')
          .eq('user_id', currentUserId)
          .in('demo_id', demoIds)
          .returns<{ demo_id: string }[]>()
      : Promise.resolve({ data: [] as { demo_id: string }[] }),
  ])

  const upvotedSet = new Set((upvotesRes.data ?? []).map((r) => r.demo_id))
  const commentsByDemo = new Map<string, CommentRow[]>()
  for (const c of commentsRes.data ?? []) {
    const list = commentsByDemo.get(c.demo_id) ?? []
    list.push({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author_id: c.author_id,
      author_name: c.author?.username ?? null,
    })
    commentsByDemo.set(c.demo_id, list)
  }

  return demos.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    author_id: d.author_id,
    author_name: d.author?.username ?? null,
    is_official: d.is_official,
    upvotes_count: d.upvotes_count,
    created_at: d.created_at,
    hasUpvoted: upvotedSet.has(d.id),
    comments: commentsByDemo.get(d.id) ?? [],
  }))
}

export interface FeedDemo extends DemoRow {
  api_slug: string
  api_name: string
  api_category: string
}

/**
 * Feed-style fetch of recent demos across every API, used on /community.
 * Returns up to `limit` rows sorted by newest first.
 */
export async function fetchRecentDemos(limit = 30): Promise<FeedDemo[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('demos')
    .select(
      'id, title, description, author_id, is_official, upvotes_count, created_at, api:apis(slug, name, category), author:profiles(username)',
    )
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<
      (RawDemo & {
        api: { slug: string; name: string; category: string } | null
      })[]
    >()

  return (data ?? [])
    .filter((d) => d.api !== null)
    .map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      author_id: d.author_id,
      author_name: d.author?.username ?? null,
      is_official: d.is_official,
      upvotes_count: d.upvotes_count,
      created_at: d.created_at,
      hasUpvoted: false,
      comments: [],
      api_slug: d.api!.slug,
      api_name: d.api!.name,
      api_category: d.api!.category,
    }))
}
