import { describe, expect, test } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateProfitMargin,
  calculateProfit,
  getProductStatus,
  calculateStockHealth,
} from "@/lib/inventory";

describe("formatCurrency", () => {
  test("formats integer as USD", () => {
    expect(formatCurrency(1500)).toBe("$1,500.00");
  });

  test("formats decimal as USD", () => {
    expect(formatCurrency(99.95)).toBe("$99.95");
  });

  test("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  test("formats large numbers with commas", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });
});

describe("formatNumber", () => {
  test("formats with locale separators", () => {
    expect(formatNumber(1000)).toBe("1,000");
  });

  test("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercentage", () => {
  test("formats percentage string", () => {
    expect(formatPercentage(25.5)).toBe("25.50%");
  });

  test("formats zero percent", () => {
    expect(formatPercentage(0)).toBe("0.00%");
  });
});

describe("calculateProfitMargin", () => {
  test("computes margin correctly", () => {
    expect(calculateProfitMargin(80, 100)).toBe(20);
  });

  test("returns 0 when cost is 0", () => {
    expect(calculateProfitMargin(0, 100)).toBe(100);
  });

  test("returns 0 when selling is 0", () => {
    expect(calculateProfitMargin(50, 0)).toBe(0);
  });
});

describe("calculateProfit", () => {
  test("computes absolute profit", () => {
    expect(calculateProfit(80, 100)).toBe(20);
  });

  test("returns negative for loss", () => {
    expect(calculateProfit(100, 80)).toBe(-20);
  });
});

describe("getProductStatus", () => {
  test("returns out_of_stock when quantity is 0", () => {
    expect(getProductStatus({ quantity: 0, minimumStock: 5, maximumStock: 100 })).toBe("out_of_stock");
  });

  test("returns low_stock when quantity is at or below minimum", () => {
    expect(getProductStatus({ quantity: 3, minimumStock: 5, maximumStock: 100 })).toBe("low_stock");
  });

  test("returns in_stock when quantity is above minimum", () => {
    expect(getProductStatus({ quantity: 50, minimumStock: 5, maximumStock: 100 })).toBe("in_stock");
  });
});

describe("calculateStockHealth", () => {
  test("returns 100 when all products are in stock", () => {
    const products = [
      { status: "in_stock" as const, quantity: 50, minimumStock: 5, maximumStock: 100 },
      { status: "in_stock" as const, quantity: 30, minimumStock: 10, maximumStock: 50 },
    ];
    expect(calculateStockHealth(products)).toBe(100);
  });

  test("returns lower score when products are low or out of stock", () => {
    const products = [
      { status: "in_stock" as const, quantity: 50, minimumStock: 5, maximumStock: 100 },
      { status: "out_of_stock" as const, quantity: 0, minimumStock: 5, maximumStock: 100 },
    ];
    expect(calculateStockHealth(products)).toBeLessThan(100);
  });

  test("returns 0 when all products are out of stock", () => {
    const products = [
      { status: "out_of_stock" as const, quantity: 0, minimumStock: 5, maximumStock: 100 },
      { status: "out_of_stock" as const, quantity: 0, minimumStock: 5, maximumStock: 100 },
    ];
    expect(calculateStockHealth(products)).toBe(0);
  });
});
