import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { SignOutButton } from '@/components/profile/SignOutButton'
import { ApiCard } from '@/components/api-card/ApiCard'
import type { ApiRow } from '@/lib/api-data/types'

export const metadata: Metadata = {
  title: 'Your profile · APIVerse',
  description: 'Edit your profile and review your saved APIs and collections.',
}

interface ProfileRow {
  username: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [profileRes, bookmarksRes, collectionCount, demoCount] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, bio, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle<ProfileRow>(),
    supabase
      .from('bookmarks')
      .select('api:apis(id, name, description, category, url, auth, https, cors, slug, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<{ api: ApiRow | null }[]>(),
    supabase
      .from('collections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('demos')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', user.id),
  ])

  const profile = profileRes.data
  const bookmarks: ApiRow[] = (bookmarksRes.data ?? [])
    .map((r) => r.api)
    .filter((a): a is ApiRow => a !== null)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-4 border-b border-neutral-200 pb-8 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url ?? null} username={profile?.username ?? null} />
          <div>
            <p className="text-sm uppercase tracking-wider text-indigo-500">
              Profile
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {profile?.username ?? 'Unnamed explorer'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Joined{' '}
              {profile?.created_at
                ? new Intl.DateTimeFormat('en-US', {
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(profile.created_at))
                : '—'}
            </p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Bookmarks" value={bookmarks.length} />
        <StatCard label="Collections" value={collectionCount.count ?? 0} />
        <StatCard label="Demos submitted" value={demoCount.count ?? 0} />
      </section>

      <section className="mb-14">
        <h2 className="mb-3 text-lg font-semibold">Edit your profile</h2>
        <div className="rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/40">
          <ProfileForm
            initialUsername={profile?.username ?? ''}
            initialBio={profile?.bio ?? ''}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Your bookmarks{' '}
          <span className="text-sm font-normal text-neutral-500">
            ({bookmarks.length})
          </span>
        </h2>
        {bookmarks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
            You haven&rsquo;t saved any APIs yet. Head to{' '}
            <Link href="/explore" className="text-indigo-500 hover:underline">
              Explore
            </Link>{' '}
            and hit the ♥ button.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((api) => (
              <li key={api.id}>
                <ApiCard api={api} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-2 bg-gradient-to-br from-indigo-500 to-fuchsia-500 bg-clip-text text-3xl font-bold tabular-nums text-transparent">
        {value}
      </p>
    </div>
  )
}

function Avatar({ src, username }: { src: string | null; username: string | null }) {
  const initial = (username ?? '?').charAt(0).toUpperCase()
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={username ? `${username}'s avatar` : 'Avatar'}
      className="h-16 w-16 rounded-full border border-neutral-200 object-cover dark:border-neutral-800"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-bold text-white"
    >
      {initial}
    </div>
  )
}
