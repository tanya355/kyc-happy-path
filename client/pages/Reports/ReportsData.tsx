/**
 * Reports page seed data + types.
 *
 * Static background gradient + placeholder copy extracted so a future
 * API layer can replace them without touching the components.
 */

export const REPORTS_BG = [
  "radial-gradient(ellipse 220% 18% at 30% 32%, rgba(0,100,200,0.038) 0%, transparent 100%)",
  "radial-gradient(ellipse 200% 14% at 70% 55%, rgba(75,0,165,0.028) 0%, transparent 100%)",
  "radial-gradient(ellipse 210% 16% at 45% 72%, rgba(0,51,141,0.032) 0%, transparent 100%)",
  "radial-gradient(ellipse 180% 12% at 85% 20%, rgba(0,125,205,0.022) 0%, transparent 100%)",
  "#EDF1F8",
].join(", ");

export interface ReportsPlaceholder {
  title: string;
  body: string;
  footer: string;
}

export const REPORTS_PLACEHOLDER: ReportsPlaceholder = {
  title: "Reports",
  body: "This section is coming soon. Continue prompting to build out reporting dashboards, compliance summaries, and export functionality.",
  footer: "No reports generated yet",
};

export interface ReportsSeed {
  background: string;
  placeholder: ReportsPlaceholder;
}

export const REPORTS_SEED: ReportsSeed = {
  background: REPORTS_BG,
  placeholder: REPORTS_PLACEHOLDER,
};

export function getReportsData(): ReportsSeed {
  return REPORTS_SEED;
}
