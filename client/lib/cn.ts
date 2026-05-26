/**
 * cn — class-name composition helper.
 *
 * Wraps clsx + tailwind-merge to safely merge Tailwind utility classes
 * without specificity conflicts. Import from "@/lib/cn" throughout the app.
 *
 * ShadCN tooling expects the alias "utils" → "@/lib/cn" in components.json.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
