"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  Wrench,
  Tags,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { sidebarAnimation, sidebarContent } from "@/lib/animations";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const { business } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        variants={sidebarAnimation}
        initial={collapsed ? "closed" : "open"}
        animate={collapsed ? "closed" : "open"}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-sidebar shadow-sidebar lg:static",
          mobileOpen ? "block" : "hidden lg:flex"
        )}
      >
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            S
          </div>
          <motion.span
            variants={sidebarContent}
            animate={collapsed ? "closed" : "open"}
            className="truncate text-sm font-semibold tracking-tight"
          >
            {business?.name ?? "Shelform"}
          </motion.span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex h-9 items-center gap-3 rounded-lg px-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <motion.span
                  variants={sidebarContent}
                  animate={collapsed ? "closed" : "open"}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <button
            onClick={toggle}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:justify-start lg:px-2"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <motion.span
                  variants={sidebarContent}
                  animate={collapsed ? "closed" : "open"}
                >
                  Collapse
                </motion.span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
