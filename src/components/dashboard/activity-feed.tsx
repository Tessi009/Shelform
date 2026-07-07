"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Package,
  ShoppingCart,
  Truck,
  Bell,
} from "lucide-react";
import { store } from "@/data/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ActivityFeed() {
  const recentOrders = useMemo(() => store.getRecentOrders(5), []);
  const productCount = store.getProducts().length;
  const orderCount = store.getOrders().length;
  const supplierCount = store.getSuppliers().length;

  const hasActivity = productCount > 0 || orderCount > 0 || supplierCount > 0;

  if (!hasActivity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Start by adding your first product or supplier.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link href="/suppliers">
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4" />
                Add Supplier
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const activities: { icon: React.ReactNode; bg: string; text: string; time: string }[] = [];

  if (recentOrders.length > 0) {
    activities.push({
      icon: <ShoppingCart className="h-3.5 w-3.5" />,
      bg: "bg-primary/10 text-primary",
      text: `${recentOrders.length} most recent order${recentOrders.length > 1 ? "s" : ""}`,
      time: "Latest orders",
    });
  }

  if (productCount > 0) {
    activities.push({
      icon: <Package className="h-3.5 w-3.5" />,
      bg: "bg-success/10 text-success",
      text: `${productCount} product${productCount > 1 ? "s" : ""} in inventory`,
      time: "Total catalog",
    });
  }

  if (supplierCount > 0) {
    activities.push({
      icon: <Truck className="h-3.5 w-3.5" />,
      bg: "bg-info/10 text-info",
      text: `${supplierCount} supplier${supplierCount > 1 ? "s" : ""} registered`,
      time: "Supply chain",
    });
  }

  if (activities.length === 0) {
    activities.push({
      icon: <Activity className="h-3.5 w-3.5" />,
      bg: "bg-muted text-muted-foreground",
      text: "System ready — start adding data",
      time: "Now",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Activity Summary</h3>
      </div>
      <div className="space-y-4">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
