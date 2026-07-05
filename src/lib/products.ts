import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function syncStockAdjustment(
  productId: string,
  delta: number,
  quantityAfter: number,
) {
  const supabase = createSupabaseBrowserClient();

  const { error: updateError } = await supabase
    .from("products")
    .update({ quantity: quantityAfter, last_updated: new Date().toISOString() })
    .eq("id", productId);

  if (updateError) {
    console.error("Failed to sync stock to Supabase:", updateError.message);
    return;
  }

  await supabase.from("stock_movements").insert({
    product_id: productId,
    delta,
    quantity_after: quantityAfter,
  });
}
