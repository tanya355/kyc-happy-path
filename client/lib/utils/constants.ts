/**
 * Application-wide constants for the KYC platform.
 *
 * Keep values here rather than inline so changes propagate automatically.
 * Import individual constants to avoid barrel-import side effects.
 */

export const APP_NAME = "KYC Platform";

/** TanStack Query stale time — 30 seconds. */
export const STALE_TIME_MS = 30_000;

/** Polling interval for live metrics — 15 seconds. */
export const POLL_INTERVAL_MS = 15_000;

/** UBO ownership threshold per policy §2.4. */
export const UBO_THRESHOLD_PERCENT = 25;

/** Maximum number of rows shown per page in data grids. */
export const PAGE_SIZE_DEFAULT = 25;
