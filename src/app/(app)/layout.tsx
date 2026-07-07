"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { ToastContainer } from "@/components/shared/toast-container";
import { pageTransition } from "@/lib/animations";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
