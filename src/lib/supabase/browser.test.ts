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

  test("does not throw in browser when SUPABASE_URL is missing, passes empty string instead", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    const [url] = mockCreateBrowserClient.mock.calls[0];
    expect(url).toBe("");
  });

  test("does not throw in browser when SUPABASE_ANON_KEY is missing, passes empty string instead", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    mockCreateBrowserClient.mockReturnValue({});

    createSupabaseBrowserClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    const [, key] = mockCreateBrowserClient.mock.calls[0];
    expect(key).toBe("");
  });

  test("provides a resilient fetch wrapper that handles network errors", async () => {
    mockCreateBrowserClient.mockReturnValue({});

    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    createSupabaseBrowserClient();

    const options: SupabaseClientOptions<"public"> | undefined =
      mockCreateBrowserClient.mock.calls[0]?.[2];

    expect(options?.global?.fetch).toBeDefined();

    const safeFetch = options!.global!.fetch!;

    const response = await safeFetch("https://example.com", { method: "GET" });

    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toBe("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("error", "network_error");
  });
});