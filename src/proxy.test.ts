import { describe, expect, test } from "vitest";
import { config } from "@/proxy";

describe("proxy configuration", () => {
  test("uses matcher key (not routes)", () => {
    expect(config).toHaveProperty("matcher");
    expect(config).not.toHaveProperty("routes");
  });

  test("matcher excludes static assets and api/auth", () => {
    const matcher = config.matcher as string[];

    expect(matcher).toHaveLength(1);
    expect(matcher[0]).toBe(
      "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    );
  });
});
