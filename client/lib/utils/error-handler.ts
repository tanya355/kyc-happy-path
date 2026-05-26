/**
 * error-handler — maps API errors to user-facing toast messages.
 * Called by TanStack Query onError callbacks; keeps error display consistent.
 */

import { toast } from "sonner";

export function handleApiError(error: unknown, context?: string): void {
  const prefix = context ? `${context}: ` : "";
  if (error instanceof Error) {
    if (error.message.includes("401")) {
      toast.error(`${prefix}Session expired — please log in again.`);
      return;
    }
    if (error.message.includes("403")) {
      toast.error(`${prefix}You don't have permission to perform this action.`);
      return;
    }
    if (error.message.includes("404")) {
      toast.error(`${prefix}Resource not found.`);
      return;
    }
    if (error.message.includes("500")) {
      toast.error(`${prefix}Server error — please try again or contact support.`);
      return;
    }
    toast.error(`${prefix}${error.message}`);
    return;
  }
  toast.error(`${prefix}An unexpected error occurred.`);
}
