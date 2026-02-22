import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RoutePath } from "@/types/routes";
import type { ClassValue } from "clsx";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

type TypedUrl = `${string}${RoutePath}`;

export function createUrl(path: RoutePath, params?: Record<string, string>): TypedUrl {
  const url = new URL(path!, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString() as TypedUrl;
}

/**
 * Generate user initials from name
 * Handles single names, multiple names, and undefined values safely
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "U";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
