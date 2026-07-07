"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { store } from "@/data/store";
import { formatCurrency } from "@/lib/inventory";
import type { OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "border border-border text-muted-foreground",
  processing: "bg-info/10 text-info",
  shipped: "bg-success/10 text-success",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const orders = store.getOrders();
  const customers = store.getCustomers();

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  if (orders.length === 0) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={staggerItem} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
            <p className="text-sm text-muted-foreground">0 total orders</p>
          </div>
        </motion.div>
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center gap-4 py-24 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Orders will automatically appear here once products are added and purchases or sales are recorded.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} total orders
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Order ID
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Items
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Total Amount
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-10 px-4" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const customer = customerMap.get(order.customerId);
                const itemCount = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.01 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="h-14 px-4 text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="h-14 px-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer?.company ?? order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="h-14 px-4 text-sm tabular-nums text-muted-foreground">
                      {itemCount}
                    </td>
                    <td className="h-14 px-4 text-sm font-medium tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="h-14 px-4">
                      <Badge
                        className={`h-6 border-0 text-[11px] font-medium ${statusStyles[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="h-14 px-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="h-14 px-4">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
