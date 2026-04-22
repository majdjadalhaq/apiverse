'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { ok: true } | { ok: false; error: string }

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/
const BIO_MAX = 240

export async function updateProfile(input: {
  username: string
  bio: string
}): Promise<ActionResult> {
  const username = input.username.trim().toLowerCase()
  const bio = input.bio.trim()

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error:
        'Username must be 3–24 chars: lowercase letters, numbers, or underscore.',
    }
  }
  if (bio.length > BIO_MAX) {
    return { ok: false, error: `Bio must be ${BIO_MAX} characters or fewer.` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ username, bio: bio || null })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'That username is taken.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/profile')
  return { ok: true }
}

export async function signOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
