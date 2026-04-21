import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_APIS } from '@/lib/api-data/apis'

/**
 * One-shot seed route. Protected by the service-role key — set it in
 * `.env.local` and call:
 *
 *   curl -X POST http://localhost:3000/api/seed \
 *     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
 *
 * Upserts on `slug`, so re-running is safe: new APIs are added, existing
 * ones have their description/category refreshed, nothing gets deleted.
 */
export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey || !url) {
    return NextResponse.json(
      { error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await admin.from('apis').upsert(PUBLIC_APIS, { onConflict: 'slug' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seeded: PUBLIC_APIS.length })
}
