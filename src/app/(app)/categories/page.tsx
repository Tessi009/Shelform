"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tags, Package, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { store } from "@/data/store";
import { formatNumber } from "@/lib/inventory";
import { staggerContainer, staggerItem } from "@/lib/animations";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "in_stock":
      return "default";
    case "low_stock":
      return "secondary";
    case "out_of_stock":
      return "destructive";
    case "discontinued":
      return "outline";
    default:
      return "default";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
    case "discontinued":
      return "Discontinued";
    default:
      return status;
  }
}

export default function CategoriesPage() {
  const categories = store.getCategories();
  const products = store.getProducts();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const toggleCategory = (id: string) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
  };

  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : null;

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Tags className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} product categories
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <motion.div
              key={cat.id}
              layout
              onClick={() => toggleCategory(cat.id)}
              className={`cursor-pointer rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary/20" : ""
              }`}
              style={{ borderTopColor: cat.color }}
            >
              <div className="border-t-[3px] rounded-t-xl" style={{ borderTopColor: cat.color }}>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="font-semibold">{cat.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {formatNumber(cat.productCount)}
                      </Badge>
                      {isSelected ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedCategoryId && filteredProducts.length > 0 && (
          <motion.div
            key="products-table"
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
          >
            <div className="border-b bg-muted/30 p-4">
              <p className="text-sm font-medium">
                Products in {selectedCategory?.name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">SKU</th>
                    <th className="p-3 text-right font-medium">Stock</th>
                    <th className="p-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {product.sku}
                      </td>
                      <td className="p-3 text-right">
                        {formatNumber(product.quantity)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={statusBadgeVariant(product.status)}>
                          {statusLabel(product.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
