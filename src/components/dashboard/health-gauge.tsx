"use client";

import { motion } from "framer-motion";
import { store } from "@/data/store";
import { calculateStockHealth } from "@/lib/inventory";
import { Activity, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HealthGauge() {
  const products = store.getProducts();
  const health = products.length > 0 ? Math.round(calculateStockHealth(products)) : 0;

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium">Inventory Health</h3>
          <p className="text-xs text-muted-foreground">
            Overall stock status score
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No inventory data</p>
            <p className="text-xs text-muted-foreground">
              Inventory health score will calculate automatically after products
              are added.
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

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (health / 100) * circumference;

  const color =
    health >= 80
      ? "var(--success)"
      : health >= 50
        ? "var(--warning)"
        : "var(--destructive)";

  const label =
    health >= 80 ? "Healthy" : health >= 50 ? "Needs Attention" : "Critical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium">Inventory Health</h3>
        <p className="text-xs text-muted-foreground">
          Overall stock status score
        </p>
      </div>
      <div className="flex flex-col items-center py-4">
        <div className="relative flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className="absolute text-2xl font-bold tracking-tight">
            {health}%
          </span>
        </div>
        <span className="mt-2 text-sm font-medium" style={{ color }}>
          {label}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          {products.filter((p) => p.status === "in_stock").length} of{" "}
          {products.length} products stocked
        </p>
      </div>
    </motion.div>
  );
}
