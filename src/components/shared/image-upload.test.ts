import { describe, expect, test } from "vitest";
import { validateImageFile } from "./image-upload";

describe("validateImageFile", () => {
  test("accepts JPEG file under 5MB", () => {
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 4 * 1024 * 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test("accepts PNG file", () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test("accepts WebP file", () => {
    const file = new File(["x"], "photo.webp", { type: "image/webp" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test("accepts AVIF file", () => {
    const file = new File(["x"], "photo.avif", { type: "image/avif" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test("rejects non-image file type", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("image");
  });

  test("rejects file larger than 5MB", () => {
    const file = new File(["x"], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5MB");
  });

  test("allows file exactly at 5MB limit", () => {
    const file = new File(["x"], "exact.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test("rejects file with no type", () => {
    const file = new File(["x"], "no-type");
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  test("rejects SVG (not in allowed types)", () => {
    const file = new File(["x"], "icon.svg", { type: "image/svg+xml" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });
});
