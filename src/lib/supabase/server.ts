import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeSupabaseUrl, requireEnv } from "@/lib/supabase/url";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    sanitizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL")),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
