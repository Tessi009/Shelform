"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/modal";
import { store } from "@/data/store";
import { formatCurrency } from "@/lib/inventory";
import { useToastStore } from "@/store/toast";
import type { Service } from "@/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(() => store.getServices());
  const [addOpen, setAddOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const refresh = () => setServices([...store.getServices()]);

  const totalDone = useMemo(
    () => services.reduce((sum, s) => sum + s.servicesDone, 0),
    [services],
  );

  const totalEarned = useMemo(() => {
    const logs = store.getServiceLogs();
    return logs.reduce((sum, l) => sum + l.price, 0);
  }, [services]);

  const handleAdd = () => {
    const name = serviceName.trim();
    const price = parseFloat(servicePrice);
    if (!name || isNaN(price) || price <= 0) return;
    store.addService(name, price);
    refresh();
    setAddOpen(false);
    setServiceName("");
    setServicePrice("");
    addToast({
      title: "Service added",
      description: name + " has been added.",
      type: "success",
    });
  };

  const handleDelete = (id: string) => {
    const svc = services.find((s) => s.id === id);
    store.deleteService(id);
    refresh();
    if (svc) {
      addToast({
        title: "Service removed",
        description: svc.name + " has been removed.",
        type: "success",
      });
    }
  };

  const handleMarkDone = (id: string) => {
    const result = store.markServiceDone(id);
    if (!result) return;
    refresh();
    addToast({
      title: "Service completed",
      description: result.service.name + " done. $" + result.income.toFixed(2) + " added to income.",
      type: "success",
    });
  };

  const handleUndo = (id: string) => {
    const result = store.undoServiceDone(id);
    if (!result) return;
    refresh();
    addToast({
      title: "Service undone",
      description: result.service.name + " reverted. $" + result.income.toFixed(2) + " removed from income.",
      type: "success",
    });
  };

  const serviceLogs = store.getServiceLogs();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
            <p className="text-sm text-muted-foreground">
              {services.length} services | {totalDone} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Earned from services</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">
              {formatCurrency(totalEarned)}
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            Total Services
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {services.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            Services Done
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {totalDone}
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 opacity-20 blur-sm" />
          <div className="relative rounded-lg border bg-card p-4 shadow-sm ring-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Earned
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(totalEarned)}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {services.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No services yet</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your first service to start tracking work and income.
              </p>
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Service
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="group relative rounded-lg border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg gap-1.5 text-xs font-semibold border-0 shadow-sm h-8"
                      onClick={() => handleMarkDone(svc.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Done
                    </Button>
                    <Button
                      size="sm"
                      className="text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg gap-1.5 text-xs font-semibold border-0 h-8"
                      onClick={() => handleUndo(svc.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Undo
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => handleDelete(svc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium leading-snug">{svc.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{svc.id}</p>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(svc.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Done</p>
                    <p className="font-semibold tabular-nums">{svc.servicesDone}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {serviceLogs.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Transaction History
          </div>
          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Service</th>
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceLogs.slice(0, 20).map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1, delay: i * 0.01 }}
                      className="border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <td className="h-10 px-4 text-sm">{log.serviceName}</td>
                      <td className="h-10 px-4 text-sm font-medium tabular-nums text-emerald-600">
                        +{formatCurrency(log.price)}
                      </td>
                      <td className="h-10 px-4 text-right text-xs text-muted-foreground tabular-nums">
                        {new Date(log.timestamp).toLocaleDateString()}{" "}
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setServiceName("");
          setServicePrice("");
        }}
        title="Add Service"
        description="Create a new billable service"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Web Development"
              className="h-11 w-full rounded-lg border border-input/60 bg-background/70 backdrop-blur-md px-3 text-sm outline-none transition-all duration-200 focus:border-input focus:bg-background/90 focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              placeholder="e.g. 499.99"
              className="h-11 w-full rounded-lg border border-input/60 bg-background/70 backdrop-blur-md px-3 text-sm outline-none transition-all duration-200 focus:border-input focus:bg-background/90 focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAddOpen(false);
                setServiceName("");
                setServicePrice("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!serviceName.trim() || !servicePrice || parseFloat(servicePrice) <= 0}
            >
              Add Service
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
