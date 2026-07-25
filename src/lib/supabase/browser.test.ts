import { describe, expect, test, vi, beforeAll, beforeEach, afterEach } from "vitest";
import type { SupabaseClientOptions } from "@supabase/supabase-js";

const mockCreateBrowserClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

const OLD_ENV = process.env;

let createSupabaseBrowserClient: () => ReturnType<typeof import("@/lib/supabase/browser")["createSupabaseBrowserClient"]>;

beforeAll(async () => {
  const mod = await import("@/lib/supabase/browser");
  createSupabaseBrowserClient = mod.createSupabaseBrowserClient;
});

describe("createSupabaseBrowserClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test("sanitizes trailing slashes from SUPABASE_URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co///";
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [url] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
  });

  test("sanitizes whitespace from SUPABASE_URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "  https://example.supabase.co/  ";
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [url] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
  });

  test("passes valid placeholder strings when env vars are missing on client", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [url, key] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();
    expect(typeof url).toBe("string");
    expect(typeof key).toBe("string");
  });

  test("provides a silent fetch wrapper that returns empty 200 for auth GET failures", async () => {
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const options: SupabaseClientOptions<"public"> | undefined =
      mockCreateBrowserClient.mock.calls[0]?.[2];

    expect(options?.global?.fetch).toBeDefined();

    const safeFetch = options!.global!.fetch!;

    const response = await safeFetch("https://example.supabase.co/auth/v1/user", {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("user", null);
  });

  test("provides a silent fetch wrapper that returns empty array for data GET failures", async () => {
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const options: SupabaseClientOptions<"public"> | undefined =
      mockCreateBrowserClient.mock.calls[0]?.[2];

    expect(options?.global?.fetch).toBeDefined();

    const safeFetch = options!.global!.fetch!;

    const response = await safeFetch("https://example.supabase.co/rest/v1/profiles", {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  test("silent fetch wrapper throws for POST failures to signal user-facing errors", async () => {
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const options: SupabaseClientOptions<"public"> | undefined =
      mockCreateBrowserClient.mock.calls[0]?.[2];

    const safeFetch = options!.global!.fetch!;

    await expect(
      safeFetch("https://example.supabase.co/auth/v1/token", {
        method: "POST",
      })
    ).rejects.toThrow("[Supabase]");
  });

  test("sanitizes double-quoted SUPABASE_URL from env var", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '"https://example.supabase.co"';
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [url] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
  });

  test("sanitizes single-quoted SUPABASE_URL from env var", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "'https://example.supabase.co'";
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [url] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
  });

  test("sanitizes quoted SUPABASE_ANON_KEY from env var", () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '"test-anon-key"';
    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    const [, key] = mockCreateBrowserClient.mock.calls[0];
    expect(key).toBe("test-anon-key");
  });
});