"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Package, RefreshCw } from "lucide-react";
import { store } from "@/data/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function StockMovementChart() {
  const data = useMemo(() => store.getStockMovement(), []);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium">Stock Movement</h3>
          <p className="text-xs text-muted-foreground">
            Incoming vs outgoing stock
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <RefreshCw className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No stock movement data yet</p>
            <p className="text-xs text-muted-foreground">
              Stock movement tracking starts when products receive inventory
              updates.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Manage Products
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
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium">Stock Movement</h3>
        <p className="text-xs text-muted-foreground">
          Incoming vs outgoing stock
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="incoming"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="outgoing"
              stroke="var(--warning)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
