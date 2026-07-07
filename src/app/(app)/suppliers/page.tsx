"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Package, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { store } from "@/data/store";
import { formatNumber } from "@/lib/inventory";
import { useToastStore } from "@/store/toast";

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  contactName: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive";
}

const emptyForm: SupplierForm = {
  name: "",
  email: "",
  phone: "",
  contactName: "",
  address: "",
  city: "",
  country: "",
  status: "active",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[0.5rem] bg-zinc-100" />
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded bg-zinc-100" />
            <div className="h-3.5 w-36 rounded bg-zinc-50" />
          </div>
        </div>
      </div>
      <div className="h-10 w-full rounded-[0.5rem] bg-zinc-50" />
      <div className="overflow-hidden rounded-[0.5rem] border border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-3 py-3">
          <div className="flex gap-8">
            <div className="h-3 w-20 rounded bg-zinc-100" />
            <div className="h-3 w-24 rounded bg-zinc-100" />
            <div className="h-3 w-20 rounded bg-zinc-100" />
            <div className="h-3 w-24 rounded bg-zinc-100" />
            <div className="h-3 w-16 rounded bg-zinc-100" />
            <div className="h-3 w-14 rounded bg-zinc-100" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b border-zinc-100 px-3 py-4 last:border-0">
            <div className="h-9 w-9 rounded-[0.5rem] bg-zinc-100" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-32 rounded bg-zinc-100" />
              <div className="h-3 w-20 rounded bg-zinc-50" />
            </div>
            <div className="h-3.5 w-28 rounded bg-zinc-50 ml-auto" />
            <div className="h-3.5 w-24 rounded bg-zinc-50" />
            <div className="h-3.5 w-20 rounded bg-zinc-50" />
            <div className="h-5 w-14 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AddSupplierDialog({
  open,
  onClose,
  form,
  setForm,
  onSave,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  form: SupplierForm;
  setForm: React.Dispatch<React.SetStateAction<SupplierForm>>;
  onSave: () => void;
  submitting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/15 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-[0.5rem] bg-white shadow-xl ring-1 ring-zinc-200/60"
          >
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900">Add Supplier</h3>
                <p className="mt-0.5 text-[13px] text-zinc-400">Create a new supplier record</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-[0.25rem] text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 pb-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Supplier Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Acme Supplies"
                  className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@acme.com"
                    className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-700">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Contact Name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-700">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Business Ave"
                  className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-700">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Portland"
                    className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-700">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g. US"
                    className="h-10 w-full rounded-[0.5rem] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors duration-150 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-0"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-[0.5rem] bg-white px-4 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!form.name.trim() || submitting}
                className="h-8 rounded-[0.5rem] bg-zinc-900 px-4 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Add Supplier"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(() => store.getSuppliers());
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const fetchFromApi = async () => {
      try {
        const res = await fetch("/api/suppliers");
        if (!res.ok) throw new Error("API unavailable");
        const json = await res.json();
        if (json.suppliers && json.suppliers.length > 0) {
          const mapped = json.suppliers.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            name: s.name as string,
            contactName: (s.contact_name as string) || "",
            email: (s.email as string) || "",
            phone: (s.phone as string) || "",
            address: (s.address as string) || "",
            city: (s.city as string) || "",
            country: (s.country as string) || "",
            status: (s.status as "active" | "inactive") || "active",
            productCount: (s.product_count as number) || 0,
            createdAt: (s.created_at as string) || "",
            updatedAt: (s.updated_at as string) || "",
          }));
          setSuppliers(mapped);
        }
      } catch {
        // Fall back to in-memory store
      } finally {
        setLoading(false);
      }
    };
    fetchFromApi();
  }, []);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const source = q
      ? store.searchSuppliers(q)
      : suppliers;
    return source.map((s) => ({
      ...s,
      location: `${s.city}, ${s.country}`,
    }));
  }, [suppliers, search]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast({
          title: "Failed to add supplier",
          description: err.error || "Something went wrong",
          type: "error",
        });
        return;
      }
      const json = await res.json();
      const created = json.supplier;
      const mapped = {
        id: created.id as string,
        name: created.name as string,
        contactName: (created.contact_name as string) || "",
        email: (created.email as string) || "",
        phone: (created.phone as string) || "",
        address: (created.address as string) || "",
        city: (created.city as string) || "",
        country: (created.country as string) || "",
        status: (created.status as "active" | "inactive") || "active",
        productCount: (created.product_count as number) || 0,
        createdAt: (created.created_at as string) || "",
        updatedAt: (created.updated_at as string) || "",
      };
      store.addSupplier(mapped);
      setSuppliers([mapped, ...store.getSuppliers().filter((s) => s.id !== mapped.id)]);
      setAddOpen(false);
      setForm(emptyForm);
      addToast({
        title: "Supplier added",
        description: `${form.name} has been created.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Network error",
        description: "Could not reach the server.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <LoadingSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.5rem] bg-zinc-50">
            <Truck className="h-5 w-5 text-zinc-500" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">Suppliers</h2>
            <p className="text-[13px] text-zinc-400">
              {suppliers.length > 0
                ? `${suppliers.length} total suppliers`
                : "No suppliers yet"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-[0.5rem] bg-zinc-900 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Supplier
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
        <Input
          type="text"
          placeholder="Search suppliers by name, email, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-[0.5rem] border-zinc-200 bg-white pl-9 text-[13px] text-zinc-900 placeholder:text-zinc-300 focus-visible:border-zinc-400 focus-visible:ring-0"
        />
      </div>

      <div className="overflow-hidden rounded-[0.5rem] border border-zinc-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Name</th>
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Email</th>
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Phone</th>
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">City / Country</th>
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Products</th>
                <th className="h-9 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((supplier, i) => (
                <motion.tr
                  key={supplier.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: i * 0.008 }}
                  className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50"
                >
                  <td className="h-12 px-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[0.5rem] bg-zinc-100 text-[12px] font-medium text-zinc-500">
                        {supplier.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-zinc-900">{supplier.name}</p>
                        <p className="text-[12px] text-zinc-400">{supplier.contactName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="h-12 px-3">
                    <span className="text-[13px] text-zinc-500">{supplier.email}</span>
                  </td>
                  <td className="h-12 px-3">
                    <span className="text-[13px] text-zinc-500">{supplier.phone}</span>
                  </td>
                  <td className="h-12 px-3">
                    <span className="text-[13px] text-zinc-500">
                      {supplier.city || supplier.country
                        ? `${supplier.city}, ${supplier.country}`
                        : "—"}
                    </span>
                  </td>
                  <td className="h-12 px-3">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-zinc-300" />
                      <span className="text-[13px] font-medium tabular-nums text-zinc-700">{formatNumber(supplier.productCount)}</span>
                    </div>
                  </td>
                  <td className="h-12 px-3">
                    <div className={`inline-flex h-5 items-center rounded-[0.25rem] px-2 text-[11px] font-medium ${
                      supplier.status === "active"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-400"
                    }`}>
                      {supplier.status === "active" ? "Active" : "Inactive"}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <Truck className="h-10 w-10 text-zinc-200" />
            <div>
              <p className="text-[13px] font-medium text-zinc-700">
                {search ? "No suppliers match your search" : "No suppliers found"}
              </p>
              <p className="text-[13px] text-zinc-400">
                {search
                  ? "Try a different search term"
                  : "Add your first supplier to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-1 h-8 rounded-[0.5rem] bg-zinc-900 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5 inline mr-1" />
                Add Your First Supplier
              </button>
            )}
          </motion.div>
        )}
      </div>

      <AddSupplierDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(emptyForm);
        }}
        form={form}
        setForm={setForm}
        onSave={handleAdd}
        submitting={submitting}
      />
    </motion.div>
  );
}
