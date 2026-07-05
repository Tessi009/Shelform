import { createEmptyData, type StoreData } from "@/data/seed";
import type {
  Product,
  Supplier,
  Category,
  Customer,
  Order,
  StockMovementLog,
} from "@/types";
import { getProductStatus } from "@/lib/inventory";

class DataStore {
  private data: StoreData;

  constructor() {
    this.data = createEmptyData();
  }

  getCategories(): Category[] {
    return this.data.categories;
  }

  getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  getCustomers(): Customer[] {
    return this.data.customers;
  }

  getOrders(): Order[] {
    return this.data.orders;
  }

  addProduct(product: Product): void {
    this.data.products.unshift(product);
    const cat = this.data.categories.find((c) => c.id === product.categoryId);
    if (cat) cat.productCount = (cat.productCount || 0) + 1;
    const sup = this.data.suppliers.find((s) => s.id === product.supplierId);
    if (sup) sup.productCount = (sup.productCount || 0) + 1;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const updated = { ...existing, ...updates };
    updated.status = getProductStatus(updated);
    updated.lastUpdated = new Date().toISOString();
    this.data.products[idx] = updated;
    return updated;
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const product = this.data.products[idx];
    this.data.products.splice(idx, 1);
    const cat = this.data.categories.find((c) => c.id === product.categoryId);
    if (cat) cat.productCount = Math.max(0, (cat.productCount || 0) - 1);
    const sup = this.data.suppliers.find((s) => s.id === product.supplierId);
    if (sup) sup.productCount = Math.max(0, (sup.productCount || 0) - 1);
    return true;
  }

  addCategory(category: Category): void {
    this.data.categories.push(category);
  }

  deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    return true;
  }

  addSupplier(supplier: Supplier): void {
    this.data.suppliers.unshift(supplier);
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const idx = this.data.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.suppliers[idx] = {
      ...this.data.suppliers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.data.suppliers[idx];
  }

  deleteSupplier(id: string): boolean {
    const idx = this.data.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.suppliers.splice(idx, 1);
    return true;
  }

  addCustomer(customer: Customer): void {
    this.data.customers.push(customer);
  }

  addOrder(order: Order): void {
    this.data.orders.unshift(order);
    const customer = this.data.customers.find((c) => c.id === order.customerId);
    if (customer) {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + order.totalAmount;
    }
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.data.products.filter((p) => p.categoryId === categoryId);
  }

  getProductsBySupplier(supplierId: string): Product[] {
    return this.data.products.filter((p) => p.supplierId === supplierId);
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return this.data.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q) ||
        (p.supplierName || "").toLowerCase().includes(q),
    );
  }

  getDashboardMetrics() {
    const products = this.data.products;
    const orders = this.data.orders;

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCost = products.reduce(
      (s, p) => s + p.costPrice * p.quantity,
      0,
    );
    const inventoryValue = products.reduce(
      (s, p) => s + p.costPrice * p.quantity,
      0,
    );
    const lowStockCount = products.filter(
      (p) => p.status === "low_stock",
    ).length;
    const outOfStockCount = products.filter(
      (p) => p.status === "out_of_stock",
    ).length;
    const categoryCount = this.data.categories.length;

    return {
      totalProducts: products.length,
      totalSuppliers: this.data.suppliers.length,
      totalOrders: orders.length,
      totalCustomers: this.data.customers.length,
      totalCategories: categoryCount,
      inventoryValue,
      totalRevenue,
      totalProfit: totalRevenue - totalCost,
      averageMargin:
        totalRevenue > 0
          ? ((totalRevenue - totalCost) / totalRevenue) * 100
          : 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  getOrderStats() {
    const orders = this.data.orders;
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }

  getRevenueByMonth(): { month: string; revenue: number; profit: number }[] {
    const monthly: Record<string, { revenue: number; cost: number }> = {};

    for (const order of this.data.orders) {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = { revenue: 0, cost: 0 };
      monthly[key].revenue += order.totalAmount;
    }

    for (const product of this.data.products) {
      const date = new Date(product.lastUpdated);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthly[key]) {
        monthly[key].cost += product.costPrice * product.quantity;
      }
    }

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({
        month,
        revenue: vals.revenue,
        profit: vals.revenue - vals.cost,
      }));
  }

  getProfitByCategory(): { category: string; value: number }[] {
    const map: Record<string, number> = {};
    for (const p of this.data.products) {
      const profit = (p.sellingPrice - p.costPrice) * p.quantity;
      const catName = p.categoryName || "Uncategorized";
      map[catName] = (map[catName] || 0) + profit;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([category, value]) => ({ category, value }));
  }

  adjustProductStock(id: string, delta: number): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const quantityBefore = existing.quantity;
    const updated = {
      ...existing,
      quantity: Math.max(0, existing.quantity + delta),
    };
    updated.status = getProductStatus(updated);
    updated.lastUpdated = new Date().toISOString();
    this.data.products[idx] = updated;

    const log: StockMovementLog = {
      id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: id,
      productName: existing.name,
      delta,
      quantityBefore,
      quantityAfter: updated.quantity,
      timestamp: new Date().toISOString(),
    };
    this.data.stockMovements.unshift(log);

    return updated;
  }

  getStockMovements(productId?: string): StockMovementLog[] {
    if (productId) {
      return this.data.stockMovements.filter((m) => m.productId === productId);
    }
    return [...this.data.stockMovements];
  }

  getStockMovement(): { month: string; incoming: number; outgoing: number }[] {
    const monthly: Record<string, { incoming: number; outgoing: number }> = {};

    for (const product of this.data.products) {
      const date = new Date(product.lastUpdated);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = { incoming: 0, outgoing: 0 };
      monthly[key].incoming += product.incomingStock;
      monthly[key].outgoing += Math.max(
        0,
        product.quantity - product.reservedStock,
      );
    }

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({
        month,
        incoming: vals.incoming,
        outgoing: vals.outgoing,
      }));
  }

  getRecentOrders(limit = 5): Order[] {
    return [...this.data.orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }
}

export const store = new DataStore();
