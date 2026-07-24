import { describe, expect, test, vi, beforeEach } from "vitest";
import type { SupabaseClientOptions } from "@supabase/supabase-js";

const mockCreateBrowserClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

const { createSupabaseBrowserClient } = await import("@/lib/supabase/browser");

describe("createSupabaseBrowserClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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