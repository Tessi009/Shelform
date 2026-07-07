"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Generate inventory and sales reports
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground"
      >
        Reports coming in Phase 65–68
      </motion.div>
    </motion.div>
  );
}
