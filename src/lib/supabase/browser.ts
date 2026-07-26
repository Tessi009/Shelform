import { createBrowserClient } from "@supabase/ssr";
import { sanitizeSupabaseUrl, stripQuotes } from "@/lib/supabase/url";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-key";

function getErrorMessage(e: unknown): string {
  if (e instanceof TypeError) return e.message;
  if (e && typeof e === "object" && "message" in e) return String(e.message);
  return String(e);
}

export function createSupabaseBrowserClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const trimmedUrl = (rawUrl ?? '').trim();
  const trimmedKey = (rawKey ?? '').trim();

  if (!trimmedUrl || !trimmedKey) {
    console.warn(
      "[Supabase] Missing environment variables for browser client initialization. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  const supabaseUrl = trimmedUrl ? sanitizeSupabaseUrl(trimmedUrl) : PLACEHOLDER_URL;
  const supabaseKey = trimmedKey ? stripQuotes(trimmedKey) : PLACEHOLDER_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (input, init) => {
        try {
          return await fetch(input, init);
        } catch (error) {
          const url =
            typeof input === "string"
              ? input
              : input instanceof Request
                ? input.url
                : "";
          const method = init?.method || "GET";

          if (method === "GET" || method === "HEAD") {
            const body = url.includes("/auth/")
              ? JSON.stringify({ user: null })
              : "[]";
            return new Response(body, {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          throw new Error(
            `[Supabase] ${getErrorMessage(error)}`
          );
        }
      },
    },
  });
}
