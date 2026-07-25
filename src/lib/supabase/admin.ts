import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl } from "@/lib/supabase/url";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseUrl = rawUrl?.trim() ? sanitizeSupabaseUrl(rawUrl) : "https://placeholder.supabase.co";
const serviceKey = rawKey?.trim() ? rawKey.trim() : "placeholder-service-key";

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
