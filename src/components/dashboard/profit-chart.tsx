"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Package } from "lucide-react";
import { store } from "@/data/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProfitChart() {
  const data = useMemo(() => store.getProfitByCategory(), []);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium">Profit by Category</h3>
          <p className="text-xs text-muted-foreground">
            Top categories by profitability
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium">No profit data yet</p>
            <p className="text-xs text-muted-foreground">
              Profit breakdown by category will appear once products are added.
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
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-card p-4 ring-1 ring-foreground/5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium">Profit by Category</h3>
        <p className="text-xs text-muted-foreground">
          Top categories by profitability
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey="category"
              type="category"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              width={90}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
