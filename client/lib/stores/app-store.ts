/**
 * AppStore — global Zustand UI state for the KYC platform.
 *
 * RULE: Only synchronous UI state lives here (active panel, modal visibility,
 * sidebar state). Server data belongs in TanStack Query, not here.
 *
 * Kept intentionally minimal for alpha. Extend only for cross-screen
 * UI concerns that genuinely need to persist across route changes.
 */

import { create } from "zustand";
import type { ActivePanel } from "@/lib/utils/enums";

type AppStore = {
  /** Which side panel is currently open in the case workspace. */
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;

  /** Whether the global notification tray is open. */
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),

  notificationOpen: false,
  setNotificationOpen: (open) => set({ notificationOpen: open }),
}));
