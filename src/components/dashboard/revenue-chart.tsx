"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Package } from "lucide-react";
import { store } from "@/data/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RevenueChart() {
  const data = useMemo(() => store.getRevenueByMonth(), []);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium">Revenue Overview</h3>
          <p className="text-xs text-muted-foreground">
            Monthly revenue and profit
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <TrendingUp className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No revenue data yet</p>
            <p className="text-xs text-muted-foreground">
              Revenue will appear here once orders are created.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              View Orders
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
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Revenue Overview</h3>
          <p className="text-xs text-muted-foreground">
            Monthly revenue and profit
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success" />
            Profit
          </span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--success)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="var(--success)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--success)"
              strokeWidth={2}
              fill="url(#profitGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
