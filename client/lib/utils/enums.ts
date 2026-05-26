/**
 * Domain union constants — the KYC-platform's authoritative status/type definitions.
 *
 * CONVENTIONS (§14 of the TypeScript Style Guide):
 *   - Use `as const` objects + companion type aliases. NEVER TypeScript `enum`.
 *   - PascalCase names signal "treat as enum replacement" (intentional project variance).
 *   - All values are lowercase strings except RiskRating and Priority,
 *     which match the display labels used in the UI.
 *
 * CRITICAL TERMINOLOGY (§1.12):
 *   Risk Rating  → Elevated / Moderate / Minimal   (NEVER High / Medium / Low)
 *   Priority     → High / Medium / Low             (NEVER Elevated / Moderate / Minimal)
 *   Case Status  → five snake_case values below    (not "In Progress", "Complete", etc.)
 */

// ─── Case Status ──────────────────────────────────────────────────────────────
export const CaseStatus = {
  NOT_STARTED:        "not_started",
  IN_PROGRESS_AGENTS: "in_progress_agents",
  ANALYST_REVIEW:     "analyst_review",
  QA_REVIEW:          "qa_review",
  COMPLETE:           "complete",
} as const;

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

// ─── Risk Rating ──────────────────────────────────────────────────────────────
export const RiskRating = {
  ELEVATED: "Elevated",
  MODERATE: "Moderate",
  MINIMAL:  "Minimal",
} as const;

export type RiskRating = (typeof RiskRating)[keyof typeof RiskRating];

// ─── Priority ─────────────────────────────────────────────────────────────────
export const Priority = {
  HIGH:   "High",
  MEDIUM: "Medium",
  LOW:    "Low",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

// ─── Review Type ──────────────────────────────────────────────────────────────
export const ReviewType = {
  PERIODIC:     "periodic",
  ONBOARDING:   "onboarding",
  EVENT_DRIVEN: "event_driven",
} as const;

export type ReviewType = (typeof ReviewType)[keyof typeof ReviewType];

// ─── Active Panel (UI state) ──────────────────────────────────────────────────
export const ActivePanel = {
  AGENT:      "agent",
  EVIDENCE:   "evidence",
  EXCEPTIONS: "exceptions",
} as const;

export type ActivePanel = (typeof ActivePanel)[keyof typeof ActivePanel] | null;
