import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl } from "@/lib/supabase/url";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl?.trim() ? sanitizeSupabaseUrl(rawUrl) : "https://placeholder.supabase.co";
const supabaseAnonKey = rawKey?.trim() ? rawKey.trim() : "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
