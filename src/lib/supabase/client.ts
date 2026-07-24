import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl, requireEnv } from "@/lib/supabase/url";

const supabaseUrl = sanitizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL"));
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
