export function sanitizeSupabaseUrl(url: string): string {
  if (!url) {
    if (typeof window !== "undefined") return "";
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty");
  }
  const trimmed = url.trim();
  if (!trimmed) {
    if (typeof window !== "undefined") return "";
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty");
  }
  return trimmed.replace(/\/+$/, "");
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (value && value.trim() !== "") {
    return value.trim();
  }
  if (typeof window !== "undefined") {
    return "";
  }
  throw new Error(`${key} environment variable is required but was ${value === undefined ? "undefined" : "empty"}`);
}