export function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s;
}

export function sanitizeSupabaseUrl(url: string): string {
  if (!url) {
    if (typeof window !== "undefined") return "";
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty");
  }
  const trimmed = stripQuotes(url.trim()).trim();
  if (!trimmed) {
    if (typeof window !== "undefined") return "";
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty");
  }
  return trimmed.replace(/\/+$/, "");
}

const PUBLIC_ENV_READERS: Record<string, () => string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function requireEnv(key: string): string {
  const reader = PUBLIC_ENV_READERS[key];
  const value = reader ? reader() : process.env[key];
  if (value && value.trim() !== "") {
    return stripQuotes(value.trim()).trim();
  }
  if (typeof window !== "undefined") {
    return "";
  }
  throw new Error(`${key} environment variable is required but was ${value === undefined ? "undefined" : "empty"}`);
}
