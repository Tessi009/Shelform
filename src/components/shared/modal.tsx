"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { modalOverlay, modalContent } from "@/lib/animations";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12">
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-xl bg-popover p-6 shadow-dialog ring-1 ring-foreground/10"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
