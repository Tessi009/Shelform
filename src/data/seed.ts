import type {
  Category,
  Supplier,
  Product,
  Customer,
  Order,
  StockMovementLog,
  Service,
  ServiceLog,
} from "@/types";

export type StoreData = {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  stockMovements: StockMovementLog[];
  manualIncome: number;
  services: Service[];
  serviceLogs: ServiceLog[];
};

export function createEmptyData(): StoreData {
  return {
    categories: [],
    suppliers: [],
    products: [],
    customers: [],
    orders: [],
    stockMovements: [],
    manualIncome: 0,
    services: [],
    serviceLogs: [],
  };
}
