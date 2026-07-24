import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl, requireEnv } from "@/lib/supabase/url";

const supabaseUrl = sanitizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL"));
const serviceKey = requireEnv("SUPABASE_SERVICE_KEY");

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
