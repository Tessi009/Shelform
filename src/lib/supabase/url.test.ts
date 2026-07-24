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

  test("throws on empty string", () => {
    expect(() => sanitizeSupabaseUrl("")).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL is required"
    );
  });

  test("throws on whitespace-only string", () => {
    expect(() => sanitizeSupabaseUrl("   ")).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL is required"
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

  test("throws when undefined", () => {
    delete process.env.TEST_KEY;
    expect(() => requireEnv("TEST_KEY")).toThrow(
      "TEST_KEY environment variable is required but was undefined"
    );
  });

  test("throws when empty", () => {
    process.env.TEST_KEY = "";
    expect(() => requireEnv("TEST_KEY")).toThrow(
      "TEST_KEY environment variable is required but was empty"
    );
  });

  test("throws when whitespace only", () => {
    process.env.TEST_KEY = "   ";
    expect(() => requireEnv("TEST_KEY")).toThrow(
      "TEST_KEY environment variable is required but was empty"
    );
  });
});