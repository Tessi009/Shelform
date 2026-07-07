import type { Product, ProductStatus, InventoryMetrics } from "@/types";

export function calculateProfitMargin(cost: number, selling: number): number {
  if (selling <= 0) return 0;
  if (cost <= 0) return 100;
  return ((selling - cost) / selling) * 100;
}

export function calculateProfit(cost: number, selling: number): number {
  return selling - cost;
}

export function getProductStatus(product: {
  quantity: number;
  minimumStock: number;
  maximumStock: number;
}): ProductStatus {
  if (product.quantity <= 0) return "out_of_stock";
  if (product.quantity <= product.minimumStock) return "low_stock";
  return "in_stock";
}

export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
}

export function calculateTotalRevenue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
}

export function calculateTotalProfit(products: Product[]): number {
  return products.reduce(
    (sum, p) => sum + (p.sellingPrice - p.costPrice) * p.quantity,
    0
  );
}

export function calculateStockHealth(products: Product[]): number {
  if (products.length === 0) return 100;
  const healthy = products.filter(
    (p) => p.quantity > p.minimumStock && p.status !== "discontinued"
  ).length;
  return (healthy / products.length) * 100;
}

export function countLowStock(products: Product[]): number {
  return products.filter((p) => p.status === "low_stock").length;
}

export function countOutOfStock(products: Product[]): number {
  return products.filter((p) => p.status === "out_of_stock").length;
}

export function getInventoryMetrics(products: Product[]): InventoryMetrics {
  const inventoryValue = calculateInventoryValue(products);
  const totalProfit = calculateTotalProfit(products);
  const totalRevenue = calculateTotalRevenue(products);
  const profitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const stockHealth = calculateStockHealth(products);
  const lowStockItems = countLowStock(products);
  const outOfStockItems = countOutOfStock(products);
  const reservedValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.reservedStock,
    0
  );
  const incomingValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.incomingStock,
    0
  );

  return {
    inventoryValue,
    totalProfit,
    profitMargin,
    stockHealth,
    lowStockItems,
    outOfStockItems,
    reservedValue,
    incomingValue,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function statusLabel(status: ProductStatus): string {
  const map: Record<ProductStatus, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    discontinued: "Discontinued",
  };
  return map[status];
}

export function generateSku(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const num = String(index + 1).padStart(5, "0");
  return `${prefix}-${num}`;
}

export function generateBarcode(): string {
  const digits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `SHELF${digits}`;
}
