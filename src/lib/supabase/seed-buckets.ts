import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKETS = [
  { name: "avatars", public: true },
  { name: "product-images", public: true },
] as const;

export async function ensureStorageBuckets(): Promise<void> {
  for (const bucket of BUCKETS) {
    const { data: existing } = await supabaseAdmin.storage.getBucket(bucket.name);
    if (!existing) {
      const { error } = await supabaseAdmin.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      });
      if (error) throw error;
    }
  }
}
