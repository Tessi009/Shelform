import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeSupabaseUrl } from "@/lib/supabase/url";

export async function createSupabaseServerClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl?.trim() || !rawKey?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    sanitizeSupabaseUrl(rawUrl),
    rawKey.trim(),
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
