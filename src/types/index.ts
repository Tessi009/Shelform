export type ProductStatus =
  "in_stock" | "low_stock" | "out_of_stock" | "discontinued";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  "credit_card" | "bank_transfer" | "cash" | "paypal" | "stripe";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  productCount: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive";
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  image: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reservedStock: number;
  incomingStock: number;
  minimumStock: number;
  maximumStock: number;
  warehouse?: string;
  shelf?: string;
  status: ProductStatus;
  lastUpdated: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  totalOrders: number;
  totalCustomers: number;
  inventoryValue: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalIncome: number;
}

export interface InventoryMetrics {
  inventoryValue: number;
  totalProfit: number;
  profitMargin: number;
  stockHealth: number;
  lowStockItems: number;
  outOfStockItems: number;
  reservedValue: number;
  incomingValue: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  previousValue?: number;
}

export interface SalesDataPoint {
  month: string;
  revenue: number;
  profit: number;
  cost: number;
}

export interface StockMovementPoint {
  month: string;
  incoming: number;
  outgoing: number;
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  quantityBefore: number;
  quantityAfter: number;
  timestamp: string;
}
