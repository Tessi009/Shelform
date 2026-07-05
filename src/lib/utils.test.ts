import { describe, expect, test, vi } from "vitest";
import { imageUrlWithCache } from "./utils";

describe("imageUrlWithCache", () => {
  test("appends cache-busting query param to URL", () => {
    const result = imageUrlWithCache(
      "https://supabase.co/storage/v1/object/public/avatars/photo.jpg",
    );
    expect(result).toMatch(
      /^https:\/\/supabase\.co\/storage\/v1\/object\/public\/avatars\/photo\.jpg\?t=\d+$/,
    );
  });

  test("returns undefined for undefined input", () => {
    expect(imageUrlWithCache(undefined)).toBeUndefined();
  });

  test("returns undefined for null input", () => {
    expect(imageUrlWithCache(null)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(imageUrlWithCache("")).toBeUndefined();
  });

  test("generates different timestamps on successive calls", () => {
    vi.useFakeTimers();
    const url =
      "https://supabase.co/storage/v1/object/public/avatars/photo.jpg";
    const a = imageUrlWithCache(url);
    vi.advanceTimersByTime(1);
    const b = imageUrlWithCache(url);
    expect(a).not.toBe(b);
    vi.useRealTimers();
  });
});
