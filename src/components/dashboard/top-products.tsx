"use client";

import { motion } from "framer-motion";
import { store } from "@/data/store";
import { formatCurrency } from "@/lib/inventory";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopProducts() {
  const products = store
    .getProducts()
    .sort((a, b) => b.sellingPrice * b.quantity - a.sellingPrice * a.quantity)
    .slice(0, 6);

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium">Top Products</h3>
          <p className="text-xs text-muted-foreground">By inventory value</p>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <TrendingUp className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs text-muted-foreground">
              Top products ranking will appear once products are added.
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium">Top Products</h3>
        <p className="text-xs text-muted-foreground">By inventory value</p>
      </div>
      <div className="space-y-3">
        {products.map((product, i) => {
          const value = product.sellingPrice * product.quantity;
          return (
            <div key={product.id} className="flex items-center gap-3">
              <span className="w-5 text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                  {product.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.quantity} units
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(value)}</p>
                <Badge
                  variant={
                    product.status === "in_stock"
                      ? "default"
                      : "secondary"
                  }
                  className="h-5 text-[10px]"
                >
                  {product.status === "in_stock"
                    ? "Active"
                    : product.status === "low_stock"
                      ? "Low"
                      : "Out"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
