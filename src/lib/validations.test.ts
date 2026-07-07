import { describe, expect, test } from "vitest";
import { validateProduct, productSchema } from "@/lib/validations";

describe("productSchema", () => {
  test("accepts valid product with all fields", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      categoryId: "cat-1",
      supplierId: "sup-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 1,
      incomingStock: 2,
      minimumStock: 3,
      maximumStock: 100,
      warehouse: "Warehouse A",
      shelf: "A-01",
    });
    expect(result.success).toBe(true);
  });

  test("accepts product without categoryId", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      supplierId: "sup-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
      warehouse: "Warehouse A",
      shelf: "A-01",
    });
    expect(result.success).toBe(true);
  });

  test("accepts product without supplierId", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      categoryId: "cat-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
      warehouse: "Warehouse A",
      shelf: "A-01",
    });
    expect(result.success).toBe(true);
  });

  test("accepts product without warehouse", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      categoryId: "cat-1",
      supplierId: "sup-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
      shelf: "A-01",
    });
    expect(result.success).toBe(true);
  });

  test("accepts product without shelf", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      categoryId: "cat-1",
      supplierId: "sup-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
      warehouse: "Warehouse A",
    });
    expect(result.success).toBe(true);
  });

  test("accepts product with empty strings for optional fields", () => {
    const result = productSchema.safeParse({
      name: "Test Product",
      categoryId: "",
      supplierId: "",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
      warehouse: "",
      shelf: "",
    });
    expect(result.success).toBe(true);
  });

  test("rejects product without name", () => {
    const result = productSchema.safeParse({
      supplierId: "sup-1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
    });
    expect(result.success).toBe(false);
  });

  test("rejects product with empty name", () => {
    const result = productSchema.safeParse({
      name: "",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 3,
      maximumStock: 100,
    });
    expect(result.success).toBe(false);
  });

  test("rejects product with negative cost price", () => {
    const result = productSchema.safeParse({
      name: "Test",
      costPrice: -5,
      sellingPrice: 10,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
    });
    expect(result.success).toBe(false);
  });

  test("rejects product with zero maximum stock", () => {
    const result = productSchema.safeParse({
      name: "Test",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("validateProduct", () => {
  test("returns success for valid product with optional fields empty", () => {
    const result = validateProduct({
      name: "Test",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test");
    }
  });

  test("returns error for missing required name", () => {
    const result = validateProduct({
      costPrice: 10,
      sellingPrice: 20,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });
});
