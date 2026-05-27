/**
 * Home page seed data + types.
 *
 * Hardcoded UI defaults extracted from the Home page so that an API-backed
 * provider can later replace these constants without touching the components.
 */

export type HomeViewKey = "all" | "periodic" | "onboarding";

export interface HomeViewOption {
  key: HomeViewKey;
  label: string;
}

export const HOME_VIEW_OPTIONS: readonly HomeViewOption[] = [
  { key: "all", label: "All" },
  { key: "periodic", label: "Periodic Refresh" },
  { key: "onboarding", label: "Onboarding" },
] as const;

export const HOME_INITIAL_SELECTED_IDS: readonly string[] = [
  "advisors",
  "institutional",
  "entity13",
];

export const HOME_SEARCH_RESULT_COUNT_SEED = 389;

export interface HomeSeed {
  viewOptions: readonly HomeViewOption[];
  initialSelectedIds: readonly string[];
  searchResultCount: number;
}

export const HOME_SEED: HomeSeed = {
  viewOptions: HOME_VIEW_OPTIONS,
  initialSelectedIds: HOME_INITIAL_SELECTED_IDS,
  searchResultCount: HOME_SEARCH_RESULT_COUNT_SEED,
};

export function getHomeData(): HomeSeed {
  return HOME_SEED;
}
