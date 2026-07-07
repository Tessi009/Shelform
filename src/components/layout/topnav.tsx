"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, Bell } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/profile/profile-dropdown";
import { fadeInDown } from "@/lib/animations";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/suppliers": "Suppliers",
  "/orders": "Orders",
  "/categories": "Categories",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function TopNav() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebarStore();
  const title = pageTitles[pathname] || "Shelform";

  return (
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md"
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <h1 className="text-base font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <ProfileDropdown />
      </div>
    </motion.header>
  );
}
