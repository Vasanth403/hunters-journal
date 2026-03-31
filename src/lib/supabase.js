import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing the app still works in local-only mode
export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseEnabled = Boolean(url && key);
