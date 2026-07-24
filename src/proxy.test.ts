import { describe, expect, test } from "vitest";
import { config } from "@/proxy";

/**
 * Converts a Next.js matcher pattern to a RegExp for testing.
 * Next.js uses its own pattern syntax but the regex-based
 * patterns (those starting with / followed by (...)) are
 * standard JS regex.
 */
function patternToRegex(pattern: string): RegExp {
  return new RegExp(`^${pattern}$`);
}

describe("proxy configuration", () => {
  test("uses matcher key (not routes)", () => {
    expect(config).toHaveProperty("matcher");
    expect(config).not.toHaveProperty("routes");
  });

  describe("matcher excludes non-page routes", () => {
    test.each([
      "/api/suppliers",
      "/api/auth/signup",
      "/api/products",
      "/api/orders",
    ])("excludes API path: %s", (path) => {
      const regex = patternToRegex(config.matcher![0]);
      expect(regex.test(path)).toBe(false);
    });

    test.each([
      "/_next/static/chunks/main.js",
      "/_next/image?url=test.jpg",
    ])("excludes next static path: %s", (path) => {
      const regex = patternToRegex(config.matcher![0]);
      expect(regex.test(path)).toBe(false);
    });

    test("excludes favicon.ico", () => {
      const regex = patternToRegex(config.matcher![0]);
      expect(regex.test("/favicon.ico")).toBe(false);
    });
  });

  describe("matcher includes page routes", () => {
    test.each([
      "/dashboard",
      "/login",
      "/signup",
      "/onboarding",
      "/settings",
      "/products",
      "/suppliers",
      "/orders",
      "/categories",
      "/services",
      "/reports",
    ])("includes page route: %s", (path) => {
      const regex = patternToRegex(config.matcher![0]);
      expect(regex.test(path)).toBe(true);
    });
  });
});