"use client";

import { Package, ShoppingCart, DollarSign, Boxes, Truck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import { StockMovementChart } from "@/components/dashboard/stock-movement-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HealthGauge } from "@/components/dashboard/health-gauge";
import { Button } from "@/components/ui/button";
import { store } from "@/data/store";
import { formatCurrency } from "@/lib/inventory";

export default function DashboardPage() {
  const metrics = store.getDashboardMetrics();
  const hasData =
    metrics.totalProducts > 0 ||
    metrics.totalOrders > 0 ||
    metrics.totalIncome > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Boxes className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome to Shelform
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            Your inventory management system is ready. Add your first products,
            suppliers, and categories to see your dashboard come to life.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/products">
            <Button size="lg">
              <Package className="h-4 w-4" />
              Add Products
            </Button>
          </Link>
          <Link href="/suppliers">
            <Button variant="outline" size="lg">
              <Truck className="h-4 w-4" />
              Add Suppliers
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" size="lg">
              <Boxes className="h-4 w-4" />
              Set Up Categories
            </Button>
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 mt-8 max-w-2xl">
          <div className="rounded-xl border bg-card p-4 text-left">
            <p className="text-sm font-medium">1. Add Products</p>
            <p className="text-xs text-muted-foreground">
              Create products with SKU, price, stock levels, and categories.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-left">
            <p className="text-sm font-medium">2. Register Suppliers</p>
            <p className="text-xs text-muted-foreground">
              Add your vendors and link them to products.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-left">
            <p className="text-sm font-medium">3. Create Orders</p>
            <p className="text-xs text-muted-foreground">
              Track purchases, sales, and stock changes in real time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Inventory overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={<Package className="h-4 w-4" />}
          formatter={(v) => v.toLocaleString()}
        />
        <StatsCard
          title="Inventory Value"
          value={metrics.inventoryValue}
          icon={<DollarSign className="h-4 w-4" />}
          formatter={(v) => formatCurrency(v)}
        />
        <StatsCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={<ShoppingCart className="h-4 w-4" />}
          formatter={(v) => v.toLocaleString()}
        />
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 opacity-20 blur-sm" />
          <StatsCard
            title="Total Income"
            value={metrics.totalIncome}
            icon={<TrendingUp className="h-4 w-4" />}
            formatter={(v) => formatCurrency(v)}
            className="relative ring-emerald-500/20 [&_svg]:text-emerald-600"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart />
        <ProfitChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StockMovementChart />
        <TopProducts />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LowStockWidget />
        <ActivityFeed />
        <HealthGauge />
      </div>
    </div>
  );
}
