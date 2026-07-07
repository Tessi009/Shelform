"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import { store } from "@/data/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LowStockWidget() {
  const lowStock = store
    .getProducts()
    .filter((p) => p.status === "low_stock" || p.status === "out_of_stock")
    .slice(0, 5);

  const productCount = store.getProducts().length;

  if (productCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-medium">Stock Alerts</h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No products tracked yet</p>
            <p className="text-xs text-muted-foreground">
              Low stock and out-of-stock alerts will appear once products are
              added.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Add Products
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (lowStock.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <h3 className="text-sm font-medium">Stock Alerts</h3>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <Package className="h-8 w-8 text-muted-foreground/40" />
          <p className="font-medium text-foreground">All products stocked</p>
          <p>No items need attention.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-medium">Stock Alerts</h3>
      </div>
      <div className="space-y-3">
        {lowStock.map((product) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-2 w-2 shrink-0 rounded-full ${
                  product.status === "out_of_stock"
                    ? "bg-destructive"
                    : "bg-warning"
                }`}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
            </div>
            <div className="ml-3 shrink-0 text-right">
              <p className="text-sm font-medium">{product.quantity} left</p>
              <p className="text-xs text-muted-foreground">
                Min: {product.minimumStock}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
