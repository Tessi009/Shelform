"use client";

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-400" />
    </div>
  );
}
