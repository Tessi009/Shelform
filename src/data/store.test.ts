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

    test("totalIncome reflects both order revenue and manual deduction income", () => {
      const p = makeProduct({
        id: "deduct-combined",
        quantity: 100,
        sellingPrice: 25,
      });
      store.addProduct(p);

      const before = store.getDashboardMetrics();
      store.deductCustomStock("deduct-combined", 4);
      const after = store.getDashboardMetrics();

      expect(after.totalIncome).toBeGreaterThan(before.totalRevenue);
      expect(after.totalIncome).toBeGreaterThan(before.totalIncome);
    });
  });

  describe("Services", () => {
    test("addService adds and getServices returns services", () => {
      const s = store.addService("Web Development", 500);
      expect(s.name).toBe("Web Development");
      expect(s.price).toBe(500);
      expect(s.servicesDone).toBe(0);

      const all = store.getServices();
      const found = all.find((x) => x.id === s.id);
      expect(found).toBeDefined();
    });

    test("deleteService removes a service", () => {
      const s = store.addService("Temp Service", 100);
      expect(store.getServices().find((x) => x.id === s.id)).toBeDefined();

      store.deleteService(s.id);
      expect(store.getServices().find((x) => x.id === s.id)).toBeUndefined();
    });

    test("markServiceDone increments counter and returns income", () => {
      const s = store.addService("Consulting", 250);
      const result = store.markServiceDone(s.id);

      expect(result).not.toBeNull();
      expect(result!.service.servicesDone).toBe(1);
      expect(result!.income).toBe(250);

      const updated = store.getServices().find((x) => x.id === s.id);
      expect(updated?.servicesDone).toBe(1);
    });

    test("markServiceDone adds income to totalIncome in metrics", () => {
      const before = store.getDashboardMetrics().totalIncome;
      const s = store.addService("Design Sprint", 300);
      store.markServiceDone(s.id);
      const after = store.getDashboardMetrics().totalIncome;
      expect(after).toBeGreaterThan(before);
    });

    test("markServiceDone creates a service log entry", () => {
      const s = store.addService("Setup", 150);
      store.markServiceDone(s.id);

      const logs = store.getServiceLogs();
      const match = logs.find((l) => l.serviceId === s.id);
      expect(match).toBeDefined();
      expect(match!.price).toBe(150);
      expect(match!.serviceName).toBe("Setup");
    });

    test("markServiceDone returns null for non-existent service", () => {
      const result = store.markServiceDone("nonexistent");
      expect(result).toBeNull();
    });

    test("undoServiceDone decrements the servicesDone counter", () => {
      const s = store.addService("Consulting Undo", 250);
      store.markServiceDone(s.id);
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(1);

      const result = store.undoServiceDone(s.id);
      expect(result).not.toBeNull();
      expect(result!.service.servicesDone).toBe(0);
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(0);
    });

    test("undoServiceDone subtracts the exact price from totalIncome", () => {
      const s = store.addService("Undo Income", 200);
      store.markServiceDone(s.id);
      const afterMark = store.getDashboardMetrics().totalIncome;

      store.undoServiceDone(s.id);
      const afterUndo = store.getDashboardMetrics().totalIncome;
      expect(afterUndo).toBe(afterMark - 200);
    });

    test("undoServiceDone logs a negative reversal entry in serviceLogs", () => {
      const s = store.addService("Log Reversal", 150);
      store.markServiceDone(s.id);

      store.undoServiceDone(s.id);
      const logs = store.getServiceLogs();
      const reversal = logs.find((l) => l.serviceId === s.id && l.price < 0);
      expect(reversal).toBeDefined();
      expect(reversal!.price).toBe(-150);
      expect(reversal!.serviceName).toBe("Log Reversal");
    });

    test("undoServiceDone returns null for non-existent service", () => {
      const result = store.undoServiceDone("nonexistent");
      expect(result).toBeNull();
    });

    test("undoServiceDone does nothing when servicesDone is already 0", () => {
      const s = store.addService("Already Zero", 100);
      expect(s.servicesDone).toBe(0);

      const beforeIncome = store.getDashboardMetrics().totalIncome;
      const result = store.undoServiceDone(s.id);
      expect(result).toBeNull();

      const afterIncome = store.getDashboardMetrics().totalIncome;
      expect(afterIncome).toBe(beforeIncome);
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(0);
    });

    test("undoServiceDone counter never drops below 0", () => {
      const s = store.addService("Floor Test", 300);
      store.markServiceDone(s.id);
      store.markServiceDone(s.id);
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(2);

      store.undoServiceDone(s.id);
      store.undoServiceDone(s.id);
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(0);

      const result = store.undoServiceDone(s.id);
      expect(result).toBeNull();
      expect(store.getServices().find((x) => x.id === s.id)?.servicesDone).toBe(0);
    });
  });

  describe("Suppliers", () => {
    test("addSupplier adds and getSuppliers returns suppliers", () => {
      const supplier: Supplier = {
        id: "sup-test-1",
        name: "Test Supplier",
        contactName: "John",
        email: "john@test.com",
        phone: "123-456-7890",
        address: "123 Main St",
        city: "Portland",
        country: "US",
        status: "active",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addSupplier(supplier);
      const all = store.getSuppliers();
      const found = all.find((s) => s.id === "sup-test-1");
      expect(found).toBeDefined();
      expect(found!.name).toBe("Test Supplier");
      expect(found!.email).toBe("john@test.com");
      expect(found!.phone).toBe("123-456-7890");
    });

    test("updateSupplier modifies supplier fields", () => {
      const supplier: Supplier = {
        id: "sup-upd-1",
        name: "Original Co",
        contactName: "Alice",
        email: "alice@orig.com",
        phone: "111-222-3333",
        address: "",
        city: "",
        country: "",
        status: "active",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addSupplier(supplier);
      const updated = store.updateSupplier("sup-upd-1", {
        name: "Updated Co",
        email: "alice@updated.com",
        phone: "444-555-6666",
      });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated Co");
      expect(updated!.email).toBe("alice@updated.com");
      expect(updated!.phone).toBe("444-555-6666");

      const stored = store.getSuppliers().find((s) => s.id === "sup-upd-1");
      expect(stored!.name).toBe("Updated Co");
    });

    test("updateSupplier returns null for non-existent id", () => {
      const result = store.updateSupplier("nonexistent", { name: "Nope" });
      expect(result).toBeNull();
    });

    test("deleteSupplier removes a supplier", () => {
      const supplier: Supplier = {
        id: "sup-del-1",
        name: "Delete Me",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        status: "active",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.addSupplier(supplier);
      expect(store.getSuppliers().find((s) => s.id === "sup-del-1")).toBeDefined();
      store.deleteSupplier("sup-del-1");
      expect(store.getSuppliers().find((s) => s.id === "sup-del-1")).toBeUndefined();
    });

    test("deleteSupplier returns false for non-existent id", () => {
      const result = store.deleteSupplier("nonexistent");
      expect(result).toBe(false);
    });

    test("searchSuppliers filters by name, email, phone, city, country", () => {
      store.addSupplier({
        id: "sup-srch-1",
        name: "Alpha Corp",
        contactName: "",
        email: "alpha@corp.com",
        phone: "555-0101",
        address: "",
        city: "New York",
        country: "US",
        status: "active",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      store.addSupplier({
        id: "sup-srch-2",
        name: "Beta LLC",
        contactName: "",
        email: "beta@llc.com",
        phone: "555-0202",
        address: "",
        city: "Portland",
        country: "US",
        status: "active",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      store.addSupplier({
        id: "sup-srch-3",
        name: "Gamma Inc",
        contactName: "",
        email: "gamma@inc.com",
        phone: "555-0303",
        address: "",
        city: "London",
        country: "UK",
        status: "inactive",
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const byName = store.searchSuppliers("alpha");
      expect(byName.length).toBeGreaterThanOrEqual(1);
      expect(byName.some((s) => s.id === "sup-srch-1")).toBe(true);

      const byEmail = store.searchSuppliers("beta@llc");
      expect(byEmail.length).toBeGreaterThanOrEqual(1);
      expect(byEmail.some((s) => s.id === "sup-srch-2")).toBe(true);

      const byCity = store.searchSuppliers("london");
      expect(byCity.length).toBeGreaterThanOrEqual(1);
      expect(byCity.some((s) => s.id === "sup-srch-3")).toBe(true);

      const allQuery = store.searchSuppliers("");
      expect(allQuery.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getDashboardMetrics", () => {
    test("totalIncome combines order revenue and manual income", () => {
      const metrics = store.getDashboardMetrics();
      expect(metrics).toHaveProperty("totalIncome");
      expect(typeof metrics.totalIncome).toBe("number");
      expect(metrics.totalIncome).toBeGreaterThanOrEqual(metrics.totalRevenue);
    });
  });
});
