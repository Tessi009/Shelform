import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function imageUrlWithCache(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  return `${url}?t=${Date.now()}`;
}
