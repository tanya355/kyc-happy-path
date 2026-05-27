/**
 * EvidenceLocker page seed data + types.
 */

export const EVIDENCE_LOCKER_BG = [
  "radial-gradient(ellipse 220% 18% at 30% 32%, rgba(0,100,200,0.038) 0%, transparent 100%)",
  "radial-gradient(ellipse 200% 14% at 70% 55%, rgba(75,0,165,0.028) 0%, transparent 100%)",
  "radial-gradient(ellipse 210% 16% at 45% 72%, rgba(0,51,141,0.032) 0%, transparent 100%)",
  "radial-gradient(ellipse 180% 12% at 85% 20%, rgba(0,125,205,0.022) 0%, transparent 100%)",
  "#EDF1F8",
].join(", ");

export interface EvidenceLockerPlaceholder {
  title: string;
  body: string;
}

export const EVIDENCE_LOCKER_PLACEHOLDER: EvidenceLockerPlaceholder = {
  title: "Evidence Locker",
  body: "This section is coming soon. Continue prompting to build out document storage, evidence linking, and audit trail functionality.",
};

export interface EvidenceLockerSeed {
  background: string;
  placeholder: EvidenceLockerPlaceholder;
}

export const EVIDENCE_LOCKER_SEED: EvidenceLockerSeed = {
  background: EVIDENCE_LOCKER_BG,
  placeholder: EVIDENCE_LOCKER_PLACEHOLDER,
};

export function getEvidenceLockerData(): EvidenceLockerSeed {
  return EVIDENCE_LOCKER_SEED;
}
