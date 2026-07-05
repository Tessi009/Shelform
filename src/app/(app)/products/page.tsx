"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Package,
  X,
  Download,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/shared/modal";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { ProductForm } from "@/components/products/product-form";
import { store } from "@/data/store";
import { formatCurrency, formatNumber } from "@/lib/inventory";
import { useToastStore } from "@/store/toast";
import { syncStockAdjustment } from "@/lib/products";
import type { Product, ProductStatus, Category, Supplier } from "@/types";

const statusConfig: Record<
  ProductStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  in_stock: { label: "In Stock", variant: "default" },
  low_stock: { label: "Low Stock", variant: "secondary" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
  discontinued: { label: "Discontinued", variant: "outline" },
};

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(() =>
    store.getProducts(),
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    ProductStatus | ""
  >("");

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const addToast = useToastStore((s) => s.addToast);

  const refresh = () => {
    setProducts([...store.getProducts()]);
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName));
    return Array.from(set).sort();
  }, [products]);

  const filteredData = useMemo(() => {
    let result = products;
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q) ||
          (p.supplierName || "").toLowerCase().includes(q),
      );
    }
    if (activeCategoryFilter) {
      result = result.filter((p) => p.categoryName === activeCategoryFilter);
    }
    if (activeStatusFilter) {
      result = result.filter((p) => p.status === activeStatusFilter);
    }
    return result;
  }, [products, globalFilter, activeCategoryFilter, activeStatusFilter]);

  const handleAdd = (values: any) => {
    const cat = values.categoryId
      ? store.getCategories().find((c: Category) => c.id === values.categoryId)
      : undefined;
    const sup = values.supplierId
      ? store.getSuppliers().find((s: Supplier) => s.id === values.supplierId)
      : undefined;
    const nextIndex = products.length;

    const newProduct: Product = {
      id: `prd-${String(nextIndex + 1).padStart(4, "0")}`,
      image: values.image || "",
      name: values.name,
      sku:
        store.getProducts().length > 0
          ? `PRD-${String(store.getProducts().length + 1).padStart(5, "0")}`
          : "PRD-00001",
      barcode: `SHELF${Math.random().toString(36).slice(2, 14).toUpperCase()}`,
      categoryId: values.categoryId || "",
      categoryName: cat?.name || "",
      supplierId: values.supplierId || "",
      supplierName: sup?.name || "",
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      quantity: values.quantity,
      reservedStock: values.reservedStock,
      incomingStock: values.incomingStock,
      minimumStock: values.minimumStock,
      maximumStock: values.maximumStock,
      warehouse: values.warehouse || "",
      shelf: values.shelf || "",
      status:
        values.quantity <= 0
          ? "out_of_stock"
          : values.quantity <= values.minimumStock
            ? "low_stock"
            : "in_stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.addProduct(newProduct);
    refresh();
    setAddOpen(false);
    addToast({
      title: "Product added",
      description: `${newProduct.name} has been added.`,
      type: "success",
    });
  };

  const handleEdit = (values: any) => {
    if (!editProduct) return;
    const cat = values.categoryId
      ? store.getCategories().find((c: Category) => c.id === values.categoryId)
      : undefined;
    const sup = values.supplierId
      ? store.getSuppliers().find((s: Supplier) => s.id === values.supplierId)
      : undefined;
    store.updateProduct(editProduct.id, {
      ...values,
      categoryName: cat?.name || "",
      supplierName: sup?.name || "",
    });
    refresh();
    setEditProduct(null);
    addToast({
      title: "Product updated",
      description: `${editProduct.name} has been updated.`,
      type: "success",
    });
  };

  const handleAdjustStock = (id: string, delta: number) => {
    const product = store.getProductById(id);
    if (!product) return;
    const updated = store.adjustProductStock(id, delta);
    if (!updated) return;
    refresh();
    syncStockAdjustment(id, delta, updated.quantity);
    const label = delta > 0 ? "added to" : "removed from";
    addToast({
      title: "Stock updated",
      description: `1 unit ${label} ${product.name}.`,
      type: "success",
    });
  };

  const handleDelete = () => {
    if (!deleteProduct) return;
    store.deleteProduct(deleteProduct.id);
    refresh();
    setDeleteProduct(null);
    addToast({
      title: "Product deleted",
      description: `${deleteProduct.name} has been removed.`,
      type: "success",
    });
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }: any) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ getValue }: any) => (
          <span className="text-sm text-muted-foreground">{getValue()}</span>
        ),
        size: 120,
      },
      {
        accessorKey: "costPrice",
        header: "Cost",
        cell: ({ getValue }: any) => (
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(getValue())}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "sellingPrice",
        header: "Sell",
        cell: ({ getValue }: any) => (
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(getValue())}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "quantity",
        header: "Stock",
        cell: ({ row }: any) => {
          const qty = row.original.quantity;
          const min = row.original.minimumStock;
          const id = row.original.id;
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium tabular-nums">
                {formatNumber(qty)}
              </span>
              {qty <= min && (
                <span className="text-[10px] text-destructive">Low</span>
              )}
              <div className="ml-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustStock(id, 1);
                  }}
                  className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustStock(id, -1);
                  }}
                  className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: any) => {
          const status = getValue() as ProductStatus;
          return (
            <Badge
              variant={statusConfig[status].variant}
              className="h-6 text-[11px]"
            >
              {statusConfig[status].label}
            </Badge>
          );
        },
        size: 110,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: any) => {
          const product = row.original as Product;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditProduct(product);
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteProduct(product);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        size: 110,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
    enableRowSelection: true,
  });

  const clearFilters = () => {
    setGlobalFilter("");
    setActiveCategoryFilter("");
    setActiveStatusFilter("");
  };

  const hasFilters = globalFilter || activeCategoryFilter || activeStatusFilter;

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Products
              </h2>
              <p className="text-sm text-muted-foreground">0 total products</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <PackagePlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No products yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Add your first product to start tracking inventory. You&apos;ll be
              able to manage stock levels, prices, suppliers, and more.
            </p>
          </div>
          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
        <Modal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add Product"
          description="Create a new product in inventory"
        >
          <ProductForm
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
          />
        </Modal>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
            <p className="text-sm text-muted-foreground">
              {products.length} total products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={activeStatusFilter}
            onChange={(e) =>
              setActiveStatusFilter(e.target.value as ProductStatus | "")
            }
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={`h-10 px-3 text-left text-xs font-medium text-muted-foreground ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-foreground"
                          : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp className="h-3 w-3" />,
                          desc: <ChevronDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() ? (
                            <ChevronsUpDown className="h-3 w-3 opacity-30" />
                          ) : null)}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.01 }}
                  className="border-b transition-colors hover:bg-muted/50 data-[selected=true]:bg-primary/5"
                  data-selected={row.getIsSelected()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="h-14 px-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {table.getRowModel().rows.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <Package className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium">No products found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {table.getState().pagination.pageIndex * PAGE_SIZE + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * PAGE_SIZE,
            filteredData.length,
          )}{" "}
          of {filteredData.length} products
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from(
              { length: Math.min(table.getPageCount(), 7) },
              (_, i) => i + 1,
            ).map((page) => (
              <Button
                key={page}
                variant={
                  table.getState().pagination.pageIndex + 1 === page
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="min-w-[32px]"
                onClick={() => table.setPageIndex(page - 1)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Product"
        description="Create a new product in inventory"
      >
        <ProductForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Product"
        description="Update product details"
      >
        {editProduct && (
          <ProductForm
            isEdit
            defaultValues={{
              name: editProduct.name,
              image: editProduct.image,
              categoryId: editProduct.categoryId,
              supplierId: editProduct.supplierId,
              costPrice: editProduct.costPrice,
              sellingPrice: editProduct.sellingPrice,
              quantity: editProduct.quantity,
              reservedStock: editProduct.reservedStock,
              incomingStock: editProduct.incomingStock,
              minimumStock: editProduct.minimumStock,
              maximumStock: editProduct.maximumStock,
              warehouse: editProduct.warehouse,
              shelf: editProduct.shelf,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      <DeleteDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete &ldquo;${deleteProduct?.name}&rdquo;? This action cannot be undone.`}
      />
    </motion.div>
  );
}
