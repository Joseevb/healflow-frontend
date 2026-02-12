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
