import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.coerce.number().min(0.01, "Cost must be greater than 0"),
  sellingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(0),
  reservedStock: z.coerce.number().int().min(0),
  incomingStock: z.coerce.number().int().min(0),
  minimumStock: z.coerce.number().int().min(0),
  maximumStock: z.coerce.number().int().min(1, "Max stock must be at least 1"),
  warehouse: z.string().optional(),
  shelf: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function validateProduct(data: unknown): { success: true; data: ProductFormValues } | { success: false; errors: Record<string, string> } {
  const result = productSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return { success: false, errors };
}
