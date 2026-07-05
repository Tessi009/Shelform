import type {
  Category,
  Supplier,
  Product,
  Customer,
  Order,
  StockMovementLog,
} from "@/types";

export type StoreData = {
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  stockMovements: StockMovementLog[];
};

export function createEmptyData(): StoreData {
  return {
    categories: [],
    suppliers: [],
    products: [],
    customers: [],
    orders: [],
    stockMovements: [],
  };
}
