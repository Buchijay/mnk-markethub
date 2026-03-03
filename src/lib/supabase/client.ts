import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
