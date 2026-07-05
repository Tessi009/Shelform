"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only image files (JPEG, PNG, WebP, AVIF) are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be under 5MB." };
  }
  return { valid: true };
}

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  existingUrl?: string;
  onRemove?: () => void;
}

export function ImageUpload({ bucket, path: basePath, onUpload, existingUrl, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const filePath = `${basePath}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      setPreview(existingUrl || null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    onUpload(publicUrl);
    setUploading(false);
  }, [bucket, basePath, onUpload, existingUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  }, [onRemove]);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-32 max-w-full rounded-lg object-contain" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium">Drop an image here or click to browse</p>
                <p className="text-xs">JPEG, PNG, WebP, AVIF — max 5MB</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        className="hidden"
      />

      {preview && !uploading && (
        <button type="button" onClick={handleRemove} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
          Remove image
        </button>
      )}
    </div>
  );
}
