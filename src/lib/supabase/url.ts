export function sanitizeSupabaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty");
  }
  return trimmed.replace(/\/+$/, "");
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`${key} environment variable is required but was ${value === undefined ? "undefined" : "empty"}`);
  }
  return value.trim();
}