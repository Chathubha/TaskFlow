import { createClient } from '@supabase/supabase-js'

// Reads the project URL and anon key from the environment.
// Both values are safe to expose to the browser (anon key is JWT-gated by RLS).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Shared Supabase client used across the whole app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
