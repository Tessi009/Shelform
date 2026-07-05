import { describe, expect, test, beforeEach } from "vitest";
import { store } from "@/data/store";
import type { Product, Category, Supplier } from "@/types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `prd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    image: "",
    name: "Test Product",
    sku: "PRD-TEST",
    barcode: "BARCODE-TEST",
    categoryId: "",
    categoryName: "",
    supplierId: "",
    supplierName: "",
    costPrice: 10,
    sellingPrice: 20,
    quantity: 5,
    reservedStock: 0,
    incomingStock: 0,
    minimumStock: 1,
    maximumStock: 100,
    warehouse: "",
    shelf: "",
    status: "in_stock",
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("DataStore", () => {
  test("addProduct with optional category and supplier IDs", () => {
    const product: Product = {
      id: "prd-0001",
      image: "",
      name: "Optional Cat Product",
      sku: "PRD-00001",
      barcode: "BARCODE001",
      categoryId: "",
      categoryName: "",
      supplierId: "",
      supplierName: "",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
      warehouse: "",
      shelf: "",
      status: "in_stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.addProduct(product);
    const products = store.getProducts();
    const found = products.find((p) => p.id === "prd-0001");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Optional Cat Product");
    expect(found?.categoryId).toBe("");
    expect(found?.supplierId).toBe("");
  });

  test("addProduct increments category count when category is set", () => {
    const initialCount = store.getProducts().length;

    const product: Product = {
      id: "prd-0002",
      image: "",
      name: "Category Test",
      sku: "PRD-00002",
      barcode: "BARCODE002",
      categoryId: "cat-1",
      categoryName: "Electronics",
      supplierId: "",
      supplierName: "",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
      warehouse: "",
      shelf: "",
      status: "in_stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.addProduct(product);
    expect(store.getProducts().length).toBe(initialCount + 1);
  });

  test("updateProduct handles optional fields", () => {
    const product: Product = {
      id: "prd-update-1",
      image: "",
      name: "Update Test",
      sku: "PRD-UPDATE",
      barcode: "BARCODE-UPDATE",
      categoryId: "cat-1",
      categoryName: "Category 1",
      supplierId: "sup-1",
      supplierName: "Supplier 1",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
      warehouse: "Warehouse A",
      shelf: "A-01",
      status: "in_stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.addProduct(product);

    const updated = store.updateProduct("prd-update-1", {
      categoryId: "",
      supplierId: "",
      warehouse: "",
      shelf: "",
    });

    expect(updated).not.toBeNull();
    expect(updated?.categoryId).toBe("");
    expect(updated?.warehouse).toBe("");
    expect(updated?.shelf).toBe("");
  });

  test("searchProducts handles products with empty optional fields", () => {
    const product: Product = {
      id: "prd-search-1",
      image: "",
      name: "Searchable Product",
      sku: "PRD-SEARCH",
      barcode: "BARCODE-SEARCH",
      categoryId: "",
      categoryName: "",
      supplierId: "",
      supplierName: "",
      costPrice: 10,
      sellingPrice: 20,
      quantity: 5,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 1,
      maximumStock: 100,
      warehouse: "",
      shelf: "",
      status: "in_stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.addProduct(product);
    const results = store.searchProducts("Searchable");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("Searchable Product");
  });

  describe("adjustProductStock", () => {
    test("increments quantity by delta", () => {
      const p = makeProduct({ id: "adj-inc", quantity: 10 });
      store.addProduct(p);
      const result = store.adjustProductStock("adj-inc", 1);
      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(11);
    });

    test("decrements quantity by delta", () => {
      const p = makeProduct({ id: "adj-dec", quantity: 10 });
      store.addProduct(p);
      const result = store.adjustProductStock("adj-dec", -1);
      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(9);
    });

    test("re-derives status to low_stock when quantity drops to minimumStock", () => {
      const p = makeProduct({
        id: "adj-status",
        quantity: 5,
        minimumStock: 5,
        maximumStock: 50,
      });
      store.addProduct(p);
      const result = store.adjustProductStock("adj-status", -1);
      expect(result!.quantity).toBe(4);
      expect(result!.status).toBe("low_stock");
    });

    test("re-derives status to out_of_stock when quantity reaches 0", () => {
      const p = makeProduct({
        id: "adj-oos",
        quantity: 1,
        minimumStock: 5,
        maximumStock: 50,
      });
      store.addProduct(p);
      const result = store.adjustProductStock("adj-oos", -1);
      expect(result!.quantity).toBe(0);
      expect(result!.status).toBe("out_of_stock");
    });

    test("returns null for non-existent product", () => {
      const result = store.adjustProductStock("non-existent", 1);
      expect(result).toBeNull();
    });

    test("creates a stock movement log entry", () => {
      const p = makeProduct({ id: "adj-log", quantity: 20 });
      store.addProduct(p);
      store.adjustProductStock("adj-log", 1);
      store.adjustProductStock("adj-log", -1);

      const movements = store.getStockMovements();
      const productLogs = movements.filter((m) => m.productId === "adj-log");
      expect(productLogs).toHaveLength(2);
      expect(productLogs[0].delta).toBe(-1);
      expect(productLogs[1].delta).toBe(1);
    });

    test("stock movement log includes product name and timestamp", () => {
      const p = makeProduct({
        id: "adj-detail",
        name: "Detail Test",
        quantity: 15,
      });
      store.addProduct(p);
      store.adjustProductStock("adj-detail", 1);

      const movements = store.getStockMovements("adj-detail");
      expect(movements).toHaveLength(1);
      expect(movements[0].productName).toBe("Detail Test");
      expect(movements[0].delta).toBe(1);
      expect(movements[0].quantityAfter).toBe(16);
      expect(typeof movements[0].timestamp).toBe("string");
    });
  });

  describe("addManualIncome", () => {
    test("adds income and returns running total", () => {
      const total = store.addManualIncome(100);
      expect(total).toBeGreaterThanOrEqual(100);

      const total2 = store.addManualIncome(50);
      expect(total2).toBeGreaterThanOrEqual(150);
    });
  });

  describe("deductCustomStock", () => {
    test("deducts stock, logs movement, adds income", () => {
      const p = makeProduct({
        id: "deduct-test",
        quantity: 50,
        sellingPrice: 20,
      });
      store.addProduct(p);

      const result = store.deductCustomStock("deduct-test", 5);
      expect(result.product).not.toBeNull();
      expect(result.product!.quantity).toBe(45);
      expect(result.income).toBe(100);

      const log = store.getStockMovements("deduct-test");
      expect(log).toHaveLength(1);
      expect(log[0].delta).toBe(-5);
    });

    test("returns null product for non-existent id", () => {
      const result = store.deductCustomStock("does-not-exist", 10);
      expect(result.product).toBeNull();
      expect(result.income).toBe(0);
    });
  });

  describe("getDashboardMetrics", () => {
    test("includes totalIncome", () => {
      const metrics = store.getDashboardMetrics();
      expect(metrics).toHaveProperty("totalIncome");
      expect(typeof metrics.totalIncome).toBe("number");
    });
  });
});
