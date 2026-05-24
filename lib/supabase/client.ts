import { createBrowserClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config"

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase configuration:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    throw new Error("Supabase configuration is missing")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
