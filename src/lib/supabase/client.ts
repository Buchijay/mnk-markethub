import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Lazy singleton — avoids throwing during Next.js static pre-rendering when
// env vars are absent (e.g. in CI). The actual Supabase requests will still
// fail at runtime if credentials are not configured.
let _client: SupabaseClient<Database> | null = null

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    if (!_client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) {
        throw new Error(
          'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
        )
      }
      _client = createClient<Database>(url, key)
    }
    return (_client as any)[prop]
  },
})
