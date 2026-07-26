import { describe, expect, test } from "vitest";
import { sanitizeSupabaseUrl, requireEnv } from "@/lib/supabase/url";

describe("sanitizeSupabaseUrl", () => {
  test("removes single trailing slash", () => {
    expect(sanitizeSupabaseUrl("https://example.supabase.co/")).toBe(
      "https://example.supabase.co"
    );
  });

  test("removes multiple trailing slashes", () => {
    expect(sanitizeSupabaseUrl("https://example.supabase.co///")).toBe(
      "https://example.supabase.co"
    );
  });

  test("leaves URL without trailing slash unchanged", () => {
    expect(sanitizeSupabaseUrl("https://example.supabase.co")).toBe(
      "https://example.supabase.co"
    );
  });

  test("removes trailing whitespace before slash cleanup", () => {
    expect(sanitizeSupabaseUrl("  https://example.supabase.co/  ")).toBe(
      "https://example.supabase.co"
    );
  });

  test("removes trailing whitespace without slash", () => {
    expect(sanitizeSupabaseUrl("  https://example.supabase.co  ")).toBe(
      "https://example.supabase.co"
    );
  });

  test("returns empty string instead of throwing in browser on empty string", () => {
    expect(sanitizeSupabaseUrl("")).toBe("");
  });

  test("returns empty string instead of throwing in browser on whitespace-only", () => {
    expect(sanitizeSupabaseUrl("   ")).toBe("");
  });

  test("throws on empty string in server environment", () => {
    const win = globalThis.window;
    delete (globalThis as any).window;
    try {
      expect(() => sanitizeSupabaseUrl("")).toThrow(
        "NEXT_PUBLIC_SUPABASE_URL is required"
      );
    } finally {
      (globalThis as any).window = win;
    }
  });

  test("throws on whitespace-only string in server environment", () => {
    const win = globalThis.window;
    delete (globalThis as any).window;
    try {
      expect(() => sanitizeSupabaseUrl("   ")).toThrow(
        "NEXT_PUBLIC_SUPABASE_URL is required"
      );
    } finally {
      (globalThis as any).window = win;
    }
  });

  test("strips surrounding double quotes from URL", () => {
    expect(sanitizeSupabaseUrl('"https://example.supabase.co"')).toBe(
      "https://example.supabase.co"
    );
  });

  test("strips surrounding single quotes from URL", () => {
    expect(sanitizeSupabaseUrl("'https://example.supabase.co'")).toBe(
      "https://example.supabase.co"
    );
  });

  test("strips quotes and trailing slashes together", () => {
    expect(sanitizeSupabaseUrl('"https://example.supabase.co/"')).toBe(
      "https://example.supabase.co"
    );
  });

  test("strips quotes after trimming surrounding whitespace", () => {
    expect(sanitizeSupabaseUrl('  "https://example.supabase.co"  ')).toBe(
      "https://example.supabase.co"
    );
  });
});

describe("requireEnv", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test("returns trimmed value when present", () => {
    process.env.TEST_KEY = "  https://example.com  ";
    expect(requireEnv("TEST_KEY")).toBe("https://example.com");
  });

  test("throws when undefined in server environment", () => {
    const win = globalThis.window;
    delete (globalThis as any).window;
    try {
      delete process.env.TEST_KEY;
      expect(() => requireEnv("TEST_KEY")).toThrow(
        "TEST_KEY environment variable is required but was undefined"
      );
    } finally {
      (globalThis as any).window = win;
    }
  });

  test("throws when empty in server environment", () => {
    const win = globalThis.window;
    delete (globalThis as any).window;
    try {
      process.env.TEST_KEY = "";
      expect(() => requireEnv("TEST_KEY")).toThrow(
        "TEST_KEY environment variable is required but was empty"
      );
    } finally {
      (globalThis as any).window = win;
    }
  });

  test("throws when whitespace only in server environment", () => {
    const win = globalThis.window;
    delete (globalThis as any).window;
    try {
      process.env.TEST_KEY = "   ";
      expect(() => requireEnv("TEST_KEY")).toThrow(
        "TEST_KEY environment variable is required but was empty"
      );
    } finally {
      (globalThis as any).window = win;
    }
  });

  test("returns empty fallback instead of throwing in browser when undefined", () => {
    delete process.env.TEST_KEY;
    expect(requireEnv("TEST_KEY")).toBe("");
  });

  test("returns empty fallback instead of throwing in browser when empty", () => {
    process.env.TEST_KEY = "";
    expect(requireEnv("TEST_KEY")).toBe("");
  });

  test("returns empty fallback instead of throwing in browser when whitespace only", () => {
    process.env.TEST_KEY = "   ";
    expect(requireEnv("TEST_KEY")).toBe("");
  });

  test("strips surrounding double quotes from env value", () => {
    process.env.TEST_KEY = '"actual-value"';
    expect(requireEnv("TEST_KEY")).toBe("actual-value");
  });

  test("strips surrounding single quotes from env value", () => {
    process.env.TEST_KEY = "'actual-value'";
    expect(requireEnv("TEST_KEY")).toBe("actual-value");
  });

  test("strips quotes and whitespace together from env value", () => {
    process.env.TEST_KEY = '  "actual-value"  ';
    expect(requireEnv("TEST_KEY")).toBe("actual-value");
  });

  test("uses direct static access for NEXT_PUBLIC_ keys, not dynamic process.env[key]", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const value = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
    expect(value).toBe("https://example.supabase.co");
  });

  test("requireEnv with NEXT_PUBLIC_ key returns fallback when process.env lacks the property (simulates client build)", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const result = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
    expect(result).toBe("");
  });

  test("requireEnv dynamic process.env[key] loses NEXT_PUBLIC_ value that direct static access can find", () => {
    const origProcess = globalThis.process;
    try {
      const store: Record<string, string> = {};
      const envProxy = new Proxy(store, {
        get(target, prop) {
          if (typeof prop === "string" && prop.startsWith("NEXT_PUBLIC_")) {
            return undefined;
          }
          return Reflect.get(target, prop);
        },
      });
      (globalThis as any).process = { env: envProxy };

      store.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";

      const dynamicFromProxy = process.env["NEXT_PUBLIC_SUPABASE_URL"];
      expect(dynamicFromProxy).toBeUndefined();

      const result = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
      expect(result).toBe("");
    } finally {
      (globalThis as any).process = origProcess;
    }
  });
});