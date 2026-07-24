import { createBrowserClient } from "@supabase/ssr";
import { sanitizeSupabaseUrl, requireEnv } from "@/lib/supabase/url";

export function createSupabaseBrowserClient() {
  const supabaseUrl = sanitizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const supabaseKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        fetch: async (input, init) => {
          try {
            return await fetch(input, init);
          } catch {
            return new Response(
              JSON.stringify({ error: "network_error", message: "Failed to reach Supabase" }),
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        },
      },
    }
  );
}