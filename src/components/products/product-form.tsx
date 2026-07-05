"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { validateProduct, type ProductFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { store } from "@/data/store";
import {
  calculateProfit,
  calculateProfitMargin,
  formatCurrency,
} from "@/lib/inventory";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEdit,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(defaultValues?.image || "");
  const categories = store.getCategories();
  const suppliers = store.getSuppliers();
  const warehouses = [
    "Main Warehouse A",
    "East Distribution Center",
    "West Storage Facility",
    "North Logistics Hub",
    "South Fulfillment Center",
    "Central Depot",
  ];
  const shelves = [
    "A-01", "A-02", "B-01", "B-02", "C-01", "C-02", "D-01", "E-01",
  ];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<ProductFormValues>({
    defaultValues: defaultValues || {
      name: "",
      image: "",
      categoryId: "",
      supplierId: "",
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      reservedStock: 0,
      incomingStock: 0,
      minimumStock: 10,
      maximumStock: 200,
      warehouse: "",
      shelf: "",
    },
  });

  const costPrice = watch("costPrice");
  const sellingPrice = watch("sellingPrice");
  const profit = calculateProfit(costPrice || 0, sellingPrice || 0);
  const margin = calculateProfitMargin(costPrice || 0, sellingPrice || 0);

  const onFormSubmit = (data: ProductFormValues) => {
    const validation = validateProduct(data);
    if (!validation.success) {
      for (const [key, msg] of Object.entries(validation.errors)) {
        setError(key as keyof ProductFormValues, { message: msg });
      }
      return;
    }
    onSubmit({ ...validation.data, image: imageUrl });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <ImageUpload
        bucket="product-images"
        path={`products/${Date.now()}`}
        existingUrl={imageUrl || undefined}
        onUpload={setImageUrl}
        onRemove={() => setImageUrl("")}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Product Name</label>
        <Input
          {...register("name")}
          placeholder="Enter product name"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
          <select
            {...register("categoryId")}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring text-muted-foreground"
          >
            <option value="" className="text-muted-foreground">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="text-foreground">{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Supplier <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
          <select
            {...register("supplierId")}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring text-muted-foreground"
          >
            <option value="" className="text-muted-foreground">Select supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id} className="text-foreground">{sup.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cost Price ($)</label>
          <Input type="number" step="0.01" {...register("costPrice")} placeholder="0.00" className={errors.costPrice ? "border-destructive" : ""} />
          {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Selling Price ($)</label>
          <Input type="number" step="0.01" {...register("sellingPrice")} placeholder="0.00" className={errors.sellingPrice ? "border-destructive" : ""} />
          {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message}</p>}
        </div>
      </div>

      {(costPrice > 0 || sellingPrice > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profit</span>
            <span className={`font-medium tabular-nums ${profit >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(profit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Margin</span>
            <span className={`font-medium tabular-nums ${margin >= 0 ? "text-success" : "text-destructive"}`}>
              {margin.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <Input type="number" {...register("quantity")} placeholder="0" className={errors.quantity ? "border-destructive" : ""} />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reserved</label>
          <Input type="number" {...register("reservedStock")} placeholder="0" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Incoming</label>
          <Input type="number" {...register("incomingStock")} placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Min Stock</label>
          <Input type="number" {...register("minimumStock")} placeholder="10" className={errors.minimumStock ? "border-destructive" : ""} />
          {errors.minimumStock && <p className="text-xs text-destructive">{errors.minimumStock.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Stock</label>
          <Input type="number" {...register("maximumStock")} placeholder="200" className={errors.maximumStock ? "border-destructive" : ""} />
          {errors.maximumStock && <p className="text-xs text-destructive">{errors.maximumStock.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Warehouse <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
          <select {...register("warehouse")} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring text-muted-foreground">
            <option value="" className="text-muted-foreground">Select warehouse</option>
            {warehouses.map((w) => (<option key={w} value={w} className="text-foreground">{w}</option>))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Shelf <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
          <select {...register("shelf")} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring text-muted-foreground">
            <option value="" className="text-muted-foreground">Select shelf</option>
            {shelves.map((s) => (<option key={s} value={s} className="text-foreground">{s}</option>))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEdit ? "Save Changes" : "Add Product"}</Button>
      </div>
    </form>
  );
}
