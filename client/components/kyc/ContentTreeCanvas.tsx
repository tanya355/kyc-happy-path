import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Minus, Maximize2, CheckCircle2, AlertTriangle, FileText, Users, X, ExternalLink, Info, ChevronDown, ChevronRight, Filter, Sparkles, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
type ViewMode = "child" | "parent";
type DataSource = "CRM" | "Forge" | "Third Party";
type AttrStatus = "verified" | "conflict" | "missing";

export interface AttrRow {
  label: string;
  value: string;
  status?: AttrStatus;
  source: DataSource;
  group: string;
  lastUpdated?: string;
  notes?: string;
}

// ─── Attribute reasoning helper ─────────────────────────────────
interface AttrReasoning {
  confidence: number;
  whySelected: string;
  reasoningSteps: string[];
  evidenceSources: string[];
}

export function getAttrReasoning(attr: AttrRow): AttrReasoning {
  const conf =
    attr.status === "verified"
      ? attr.source === "Third Party" ? 96 : attr.source === "Forge" ? 93 : 90
      : attr.status === "conflict" ? 73
      : 38;

  const srcLabel: Record<DataSource, string> = {
    "CRM":         "Salesforce CRM",
    "Forge":       "KPMG Forge",
    "Third Party": "Refinitiv / D&B / OFAC",
  };
  const src = srcLabel[attr.source];

  const steps =
    attr.status === "verified"
      ? [
          `Attribute located in ${src} and cross-referenced against KYC policy requirements for the ${attr.group} category.`,
          `No discrepancies detected across linked entity records. Data consistency confirmed at source.`,
          `Validation concluded — attribute verified with ${conf}% confidence based on source reliability and last-updated date (${attr.lastUpdated ?? "—"}).`,
        ]
      : attr.status === "conflict"
      ? [
          `Attribute value in ${src} does not match a corresponding value in a linked record or document.`,
          `Cross-record inconsistency detected. Human review required to determine the authoritative source.`,
          `Exception flagged — confidence reduced to ${conf}% due to cross-record discrepancy. Analyst resolution required before this attribute can be validated.`,
        ]
      : [
          `Expected attribute not found in ${src} or any linked document source.`,
          `No alternative source document available to satisfy this CIP/CDD requirement at this time.`,
          `Marked as missing — cannot be validated until the required document is received. Confidence: ${conf}%.`,
        ];

  const evidenceSources =
    attr.status === "verified"
      ? [`${src} — primary source (last updated ${attr.lastUpdated ?? "—"})`, `Internal policy cross-reference — ${attr.group}`]
      : attr.status === "conflict"
      ? [`${src} — conflicting source value`, `Linked entity record — alternate value detected`, `KYC policy reference for ${attr.group}`]
      : [`Expected source: ${src}`, `Required document not yet received`];

  const whySelected =
    attr.status === "verified"
      ? `This attribute was evaluated because it is required under KYC policy for the ${attr.group} category. The recorded value was confirmed against ${src} and met all applicable compliance thresholds.`
      : attr.status === "conflict"
      ? `This attribute was flagged because an inconsistency was detected between source records. The discrepancy must be resolved by an analyst before the case can advance.`
      : `This attribute is required for ${attr.group} validation. The expected source document has not been received, leaving this item unvalidatable until collection is complete.`;

  return { confidence: conf, whySelected, reasoningSteps: steps, evidenceSources };
}

// ─── Source badge config ──────────────────────────────────────────
const SOURCE_CFG: Record<DataSource, { label: string; cls: string }> = {
  "CRM":         { label: "CRM",   cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  "Forge":       { label: "Forge", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  "Third Party": { label: "3rd",   cls: "bg-orange-50 text-orange-700 border-orange-200" },
};

// ─── Parent (DRG Group) attribute data ───────────────────────────
export const ROOT_ATTRS: AttrRow[] = [
  // Identity & Registration
  { label: "Legal Entity Type",       value: "Diversified Relationship Group",          status: "verified",  source: "Forge",        group: "Identity & Registration",    lastUpdated: "2024-11-15", notes: "Classified as DRG per KPMG policy §3.1" },
  { label: "Industry",                value: "Asset Management",                        status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
  { label: "Jurisdiction",            value: "USA",                                     status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
  { label: "Country of Incorporation",value: "United States of America",                status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2024-09-12" },
  { label: "Date Established",        value: "2015",                                    status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
  { label: "LEI Code",                value: "549300DXPX4KHQW5QL37",                   status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2025-01-03" },
  // Ownership & Control
  { label: "Global Ultimate Owner",   value: "BlackRock Inc. (NYSE: BLK)",              status: "verified",  source: "Third Party",  group: "Ownership & Control",        lastUpdated: "2024-11-20" },
  { label: "Entity Count",            value: "12",                                      status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2024-11-01" },
  { label: "Ownership Structure",     value: "Wholly Owned Subsidiaries",               status: "verified",  source: "CRM",          group: "Ownership & Control",        lastUpdated: "2024-10-15" },
  { label: "UBO Threshold",           value: "≥ 25% (Policy §2.4)",                    status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2024-10-15" },
  // Compliance & KYC
  { label: "KYC Refresh Cycle",       value: "Annual",                                  status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-11-01" },
  { label: "CIP Status",              value: "In Progress — 2 attributes pending",      status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-14", notes: "2 open exceptions require resolution" },
  { label: "AML Policy Version",      value: "AML-POL-2024-v3",                        status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-08-01" },
  { label: "Open Exceptions",         value: "5 (under review)",                       status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-15", notes: "See exception panel for details" },
  // Risk & Screening
  { label: "Sanctions Screening",     value: "Cleared — 2024-11-01",                   status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
  { label: "PEP Exposure",            value: "None Identified",                         status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
  { label: "Overall Risk Rating",     value: "Medium",                                  status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-02-20" },
  { label: "Adverse Media",           value: "No adverse findings",                     status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-04-01" },
  // Financial
  { label: "AUM (USD)",               value: "$10.5 Trillion",                          status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-12-31" },
  { label: "Primary Currency",        value: "USD",                                     status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-10-01" },
];

// ─── Entity attribute data (per entity) ──────────────────────────
export const ENTITY_ATTRS: Record<string, AttrRow[]> = {
  institutional: [
    // Identity & Registration
    { label: "Legal Name",                value: "BlackRock Institutional Trust Co.",         status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Registration No.",          value: "BR-INST-4421-US",                           status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Entity Type",               value: "Institutional Investor",                     status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Jurisdiction",              value: "USA",                                        status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "State of Incorporation",    value: "Delaware",                                   status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2024-09-12" },
    { label: "Date Established",          value: "January 15, 2001",                           status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "LEI Code",                  value: "5493001KJTIIGC8Y1R12",                       status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2025-01-03" },
    { label: "CRD Number",                value: "CRD-INST-8841",                              status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2024-11-10" },
    // Ownership & Control
    { label: "Beneficial Owner",          value: "BlackRock Inc. (>25%)",                      status: "verified",  source: "Third Party",  group: "Ownership & Control",        lastUpdated: "2024-11-20" },
    { label: "UBO Percentage",            value: "100% (wholly owned)",                        status: "verified",  source: "Third Party",  group: "Ownership & Control",        lastUpdated: "2024-11-20" },
    { label: "Control Type",              value: "Direct Ownership",                           status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2024-10-15" },
    { label: "Parent Entity",             value: "BlackRock DRG Group",                        status: "verified",  source: "CRM",          group: "Ownership & Control",        lastUpdated: "2024-10-01" },
    { label: "Board Composition",         value: "6 members — verified",                       status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2025-01-10" },
    // Compliance & KYC
    { label: "CIP Status",                value: "Incomplete — 1 attribute pending",           status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-14", notes: "Offering Memorandum overdue" },
    { label: "KYC Status",                value: "In Review",                                  status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-14" },
    { label: "Last KYC Review",           value: "2023-09-14",                                 status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2023-09-14" },
    { label: "Next Review Due",           value: "2024-09-14 (overdue)",                       status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-01", notes: "Review is 7 months overdue" },
    { label: "AML Policy Acknowledgment", value: "Confirmed — 2024-01-20",                     status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-01-20" },
    { label: "FATCA Status",              value: "Compliant — W-9 Filed",                      status: "verified",  source: "Third Party",  group: "Compliance & KYC",           lastUpdated: "2024-03-01" },
    { label: "CRS Reporting",             value: "OECD Compliant",                             status: "verified",  source: "Third Party",  group: "Compliance & KYC",           lastUpdated: "2024-06-01" },
    // Risk & Screening
    { label: "Risk Rating",               value: "Medium",                                     status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-02-20" },
    { label: "Sanctions Screening",       value: "Cleared — 2024-11-01",                       status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
    { label: "PEP Screening",             value: "No PEPs identified",                         status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
    { label: "Adverse Media",             value: "No adverse findings",                         status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-04-01" },
    { label: "Country Risk",              value: "Low — USA",                                   status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-01-15" },
    { label: "Industry Risk",             value: "Medium — Asset Management",                   status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-01-15" },
    // Financial
    { label: "AUM (USD)",                 value: "$3.2 Trillion",                              status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-12-31" },
    { label: "Primary Currency",          value: "USD",                                        status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-10-01" },
    { label: "Bank Account",              value: "HSBC — ****4821 (Verified)",                 status: "verified",  source: "Forge",        group: "Financial",                  lastUpdated: "2024-11-10" },
    { label: "SWIFT Code",               value: "MRMDUS33",                                   status: "verified",  source: "Forge",        group: "Financial",                  lastUpdated: "2024-11-10" },
    { label: "Fiscal Year End",           value: "December 31",                                 status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-10-01" },
    // Authorized Representatives
    { label: "CEO",                       value: "Martin S. Small",                            status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "CFO",                       value: "Gary S. Shedlin",                            status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Company Secretary",         value: "Rachel Lord",                                 status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Authorized Signatory",      value: "Sarah Williams (title conflict)",             status: "conflict",  source: "Forge",        group: "Representatives",            lastUpdated: "2025-04-14", notes: "Title differs across entities" },
    { label: "Compliance Officer",        value: "Christopher Meade",                          status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Legal Counsel",             value: "Simpson Thacher & Bartlett LLP",             status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    // Documents
    { label: "Certificate of Incorporation", value: "Filed — Delaware (2001)",                status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2024-09-01" },
    { label: "Offering Memorandum",       value: "Not submitted — overdue",                    status: "missing",   source: "Forge",        group: "Documents",                  lastUpdated: "2025-04-14", notes: "Required for full validation. Expected Q1 2025." },
    { label: "Board Resolution",          value: "BR-2024-0847 — Verified",                   status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2024-10-15" },
    { label: "Certificate of Incumbency", value: "Filed — Jan 10, 2026",                      status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2026-01-10" },
    { label: "UBO Declaration",           value: "Signed — Nov 15, 2025",                     status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2025-11-15" },
  ],
  advisors: [
    // Identity & Registration
    { label: "Legal Name",                value: "BlackRock Advisors LLC",                     status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Registration No.",          value: "BR-ADV-8812-US",                             status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Entity Type",               value: "Registered Investment Adviser",              status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "Jurisdiction",              value: "USA",                                        status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "State of Incorporation",    value: "New York",                                   status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2024-09-12" },
    { label: "Date Established",          value: "March 5, 1998",                              status: "verified",  source: "CRM",          group: "Identity & Registration",    lastUpdated: "2024-10-01" },
    { label: "LEI Code",                  value: "549300S9QMG2XIGPNI93",                       status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2025-01-03" },
    { label: "SEC Registration",          value: "801-47710 (Active)",                         status: "verified",  source: "Third Party",  group: "Identity & Registration",    lastUpdated: "2024-11-10" },
    // Ownership & Control
    { label: "Beneficial Owner",          value: "BlackRock Inc. (>25%)",                      status: "verified",  source: "Third Party",  group: "Ownership & Control",        lastUpdated: "2024-11-20" },
    { label: "UBO Percentage",            value: "100% (wholly owned)",                        status: "verified",  source: "Third Party",  group: "Ownership & Control",        lastUpdated: "2024-11-20" },
    { label: "Control Type",              value: "Direct Ownership",                           status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2024-10-15" },
    { label: "Parent Entity",             value: "BlackRock DRG Group",                        status: "verified",  source: "CRM",          group: "Ownership & Control",        lastUpdated: "2024-10-01" },
    { label: "Board Composition",         value: "8 members — verified",                       status: "verified",  source: "Forge",        group: "Ownership & Control",        lastUpdated: "2025-01-10" },
    // Compliance & KYC
    { label: "CIP Status",                value: "Incomplete — title mismatch",                status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-14", notes: "Authorized signatory title discrepancy" },
    { label: "KYC Status",                value: "In Review",                                  status: "conflict",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2025-04-14" },
    { label: "Last KYC Review",           value: "2024-01-10",                                 status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-01-10" },
    { label: "Next Review Due",           value: "2025-01-10",                                 status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-01-10" },
    { label: "AML Policy Acknowledgment", value: "Confirmed — 2024-02-14",                     status: "verified",  source: "Forge",        group: "Compliance & KYC",           lastUpdated: "2024-02-14" },
    { label: "FATCA Status",              value: "Compliant — W-9 Filed",                      status: "verified",  source: "Third Party",  group: "Compliance & KYC",           lastUpdated: "2024-03-01" },
    { label: "Form ADV Filed",            value: "2024-03-15 (current)",                       status: "verified",  source: "Third Party",  group: "Compliance & KYC",           lastUpdated: "2024-03-15" },
    // Risk & Screening
    { label: "Risk Rating",               value: "Medium-High",                                status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-02-20" },
    { label: "Sanctions Screening",       value: "Cleared — 2024-11-01",                       status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
    { label: "PEP Screening",             value: "No PEPs identified",                         status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2024-11-01" },
    { label: "Adverse Media",             value: "No adverse findings",                         status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-04-01" },
    { label: "Country Risk",              value: "Low — USA",                                   status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-01-15" },
    { label: "Regulatory Inquiries",      value: "None active",                                 status: "verified",  source: "Third Party",  group: "Risk & Screening",           lastUpdated: "2025-03-01" },
    // Financial
    { label: "AUM (USD)",                 value: "$1.85 Trillion",                             status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-12-31" },
    { label: "Primary Currency",          value: "USD",                                        status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-10-01" },
    { label: "Bank Account",              value: "JPMorgan — ****3301 (Verified)",             status: "verified",  source: "Forge",        group: "Financial",                  lastUpdated: "2024-11-10" },
    { label: "SWIFT Code",               value: "CHASUS33",                                   status: "verified",  source: "Forge",        group: "Financial",                  lastUpdated: "2024-11-10" },
    { label: "Fiscal Year End",           value: "December 31",                                 status: "verified",  source: "CRM",          group: "Financial",                  lastUpdated: "2024-10-01" },
    // Authorized Representatives
    { label: "CEO",                       value: "Lawrence D. Fink",                           status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "CFO",                       value: "Martin S. Small",                            status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Company Secretary",         value: "Una McMahon",                                 status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Authorized Signatory",      value: "Sarah Williams (title: CEO)",                status: "conflict",  source: "Forge",        group: "Representatives",            lastUpdated: "2025-04-14", notes: "Title 'CEO' conflicts with 'CEO, Global Equity Fund' in Institutional" },
    { label: "Compliance Officer",        value: "Amy Schioldager",                            status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    { label: "Legal Counsel",             value: "Dechert LLP",                                status: "verified",  source: "CRM",          group: "Representatives",            lastUpdated: "2024-10-01" },
    // Documents
    { label: "Certificate of Incorporation", value: "Filed — New York (1998)",               status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2024-09-01" },
    { label: "Form ADV Part 1 & 2",       value: "Filed 2024-03-15 — Current",               status: "verified",  source: "Third Party",  group: "Documents",                  lastUpdated: "2024-03-15" },
    { label: "Board Resolution",          value: "BR-2024-0847 — Verified",                   status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2024-10-15" },
    { label: "Certificate of Incumbency", value: "Filed — Jan 10, 2026",                      status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2026-01-10" },
    { label: "UBO Declaration",           value: "Signed — Nov 15, 2025",                     status: "verified",  source: "Forge",        group: "Documents",                  lastUpdated: "2025-11-15" },
  ],
};

// ─── Atoms ───────────────────────────────────────────────────────
function VerifiedChip() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-ds-green-700 bg-ds-green-000 border border-ds-green-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 size={8} strokeWidth={2.5} /> Verified
    </span>
  );
}
function ConflictTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-ds-red-700 bg-ds-red-000 border border-ds-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <AlertTriangle size={8} strokeWidth={2.5} /> Conflict
    </span>
  );
}
function MissingTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <AlertTriangle size={8} strokeWidth={2.5} /> Missing
    </span>
  );
}
function VerifiedIcon() {
  return (
    <CheckCircle2 size={24} strokeWidth={2} className="text-ds-green-700 shrink-0" aria-label="Verified" />
  );
}
function ConflictIcon() {
  return (
    <AlertTriangle size={24} strokeWidth={2} className="shrink-0" style={{ color: "var(--color-red-700)" }} aria-label="Conflict" />
  );
}
function SourcePill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-kyc-neutral-200 rounded-full px-1.5 py-0.5 mt-1.5 cursor-pointer hover:bg-gray-100">
      <FileText size={8} /> {label}
    </div>
  );
}
function AttrStatusDot({ status }: { status?: AttrStatus }) {
  if (status === "conflict") return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />;
  if (status === "missing")  return <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 mt-1" />;
}
function SourceBadge({ source }: { source: DataSource }) {
  const cfg = SOURCE_CFG[source];
  return (
    <span className={`inline-flex items-center text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Attribute Detail Popup ───────────────────────────────────────
function AttributeDetailPopup({ attr, onClose }: { attr: AttrRow; onClose: () => void }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const reasoning = getAttrReasoning(attr);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusTag =
    attr.status === "conflict" ? <ConflictTag /> :
    attr.status === "missing"  ? <MissingTag /> :
    <VerifiedChip />;

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center"
      style={{ background: "rgba(0,16,48,0.45)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Attribute detail: ${attr.label}`}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 400,
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          borderRadius: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Blue accent bar */}
        <div className="h-1 w-full shrink-0" style={{ background: "var(--color-dark-blue-600)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-kyc-neutral-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-kyc-neutral-800 truncate">{attr.label}</span>
            {statusTag}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-kyc-neutral-500 hover:text-kyc-neutral-800 hover:bg-kyc-neutral-100 transition-colors shrink-0 ml-2"
            aria-label="Close attribute detail"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">

          {/* Value */}
          <div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Value</p>
            <p className={`text-[13px] font-semibold leading-snug ${
              attr.status === "conflict" ? "text-amber-700" :
              attr.status === "missing"  ? "text-red-600"   :
              "text-kyc-neutral-800"
            }`}>{attr.value}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 border-t border-kyc-neutral-100 pt-3">
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Data Source</p>
              <SourceBadge source={attr.source} />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Group</p>
              <p className="text-[11px] font-medium text-kyc-neutral-700">{attr.group}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Last Updated</p>
              <p className="text-[11px] font-medium text-kyc-neutral-700">{attr.lastUpdated ?? "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Status</p>
              <div className="mt-0.5">{statusTag}</div>
            </div>
          </div>

          {/* Notes */}
          {attr.notes && (
            <div className="border-t border-kyc-neutral-100 pt-3">
              <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Notes</p>
              <p className="text-[11px] text-kyc-neutral-700 leading-snug">{attr.notes}</p>
            </div>
          )}

          {/* Source context */}
          <div className="border-t border-kyc-neutral-100 pt-3">
            <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-2">Source System</p>
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-kyc-neutral-50 border border-kyc-neutral-200">
              <SourceBadge source={attr.source} />
              <div className="text-[10px] text-kyc-neutral-700 leading-snug">
                {attr.source === "CRM"         && "Salesforce CRM — internal client relationship data"}
                {attr.source === "Forge"       && "KPMG Forge — workflow, KYC status, and document management"}
                {attr.source === "Third Party" && "External data vendor — Refinitiv / Dun & Bradstreet / OFAC"}
              </div>
              <button
                className="ml-auto flex items-center gap-1 text-[9px] text-kyc-neutral-500 hover:text-kyc-neutral-800 shrink-0 transition-colors"
                onClick={() => {}}
                aria-label="Open in source system"
              >
                <ExternalLink size={9} /> Open in source system
              </button>
            </div>
          </div>

          {/* Agent Reasoning — collapsible progressive disclosure */}
          <div className="border-t border-kyc-neutral-100 pt-3">
            <button
              className="w-full flex items-center justify-between gap-2 text-left"
              onClick={() => setReasoningOpen(r => !r)}
              aria-expanded={reasoningOpen}
              aria-controls="attr-reasoning-panel"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-kyc-neutral-500 shrink-0" aria-hidden />
                <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">Agent Reasoning</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                  style={{
                    background: reasoning.confidence >= 85 ? "var(--color-green-000)" : reasoning.confidence >= 60 ? "var(--color-yellow-000)" : "var(--color-red-000)",
                    borderColor: reasoning.confidence >= 85 ? "var(--color-green-200)" : reasoning.confidence >= 60 ? "var(--color-yellow-200)" : "var(--color-red-200)",
                    color: reasoning.confidence >= 85 ? "var(--color-green-700)" : reasoning.confidence >= 60 ? "var(--color-yellow-800)" : "var(--color-red-700)",
                  }}
                >
                  {reasoning.confidence}% confidence
                </span>
                {reasoningOpen
                  ? <ChevronDown size={10} className="text-kyc-neutral-400 shrink-0" />
                  : <ChevronRight size={10} className="text-kyc-neutral-400 shrink-0" />}
              </div>
            </button>

            {reasoningOpen && (
              <div id="attr-reasoning-panel" className="mt-3 space-y-3">

                {/* Why this was selected */}
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Why this was selected</p>
                  <p className="text-[10.5px] text-kyc-neutral-700 leading-snug">{reasoning.whySelected}</p>
                </div>

                {/* Reasoning steps */}
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Reasoning steps</p>
                  <ol className="space-y-1.5">
                    {reasoning.reasoningSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="shrink-0 w-[16px] h-[16px] rounded-full flex items-center justify-center text-[8px] font-bold border mt-0.5"
                          style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-600)", background: "var(--color-neutral-050)" }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-[10.5px] text-kyc-neutral-700 leading-snug">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Evidence reviewed */}
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Evidence reviewed</p>
                  <div className="space-y-1">
                    {reasoning.evidenceSources.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-1.5 border"
                        style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}
                      >
                        <FileText size={9} className="text-kyc-neutral-500 shrink-0" aria-hidden />
                        <p className="text-[10px] text-kyc-neutral-700 leading-snug">{ev}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence assessment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">Confidence assessment</p>
                    <p className="text-[9px] font-semibold text-kyc-neutral-600">{reasoning.confidence}%</p>
                  </div>
                  <div className="h-1 bg-kyc-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${reasoning.confidence}%`,
                        background: reasoning.confidence >= 85 ? "var(--color-green-500)" : reasoning.confidence >= 60 ? "var(--color-yellow-500)" : "var(--color-red-500)",
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-kyc-neutral-500 mt-1">
                    Validated against {reasoning.evidenceSources.length} source{reasoning.evidenceSources.length !== 1 ? "s" : ""} · {reasoning.reasoningSteps.length} reasoning steps
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Reasoning Drawer (now used as a tab panel in Index.tsx) ─────
export function ReasoningDrawer({ attr, onClose }: { attr: AttrRow; onClose: () => void }) {
  const reasoning = getAttrReasoning(attr);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusTag =
    attr.status === "conflict" ? <ConflictTag /> :
    attr.status === "missing"  ? <MissingTag /> :
    <VerifiedChip />;

  const confColor =
    reasoning.confidence >= 85 ? "var(--color-green-500)" :
    reasoning.confidence >= 60 ? "var(--color-yellow-500)" :
    "var(--color-red-500)";

  const confBadgeStyle = {
    background:   reasoning.confidence >= 85 ? "var(--color-green-000)"  : reasoning.confidence >= 60 ? "var(--color-yellow-000)"  : "var(--color-red-000)",
    borderColor:  reasoning.confidence >= 85 ? "var(--color-green-200)"  : reasoning.confidence >= 60 ? "var(--color-yellow-200)"  : "var(--color-red-200)",
    color:        reasoning.confidence >= 85 ? "var(--color-green-700)"  : reasoning.confidence >= 60 ? "var(--color-yellow-800)"  : "var(--color-red-700)",
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-white overflow-hidden"
      role="complementary"
      aria-label={`Agent reasoning for ${attr.label}`}
    >
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b border-kyc-neutral-200" style={{ background: "var(--color-neutral-050)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-kyc-neutral-500 shrink-0" aria-hidden />
            <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">Agent Reasoning</p>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-kyc-neutral-400 hover:text-kyc-neutral-700 hover:bg-kyc-neutral-200 rounded transition-colors"
            aria-label="Close reasoning panel"
          >
            <X size={11} />
          </button>
        </div>
        <div className="flex items-start gap-1.5 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-kyc-neutral-800 leading-tight">{attr.label}</p>
            <p className={`text-[11px] mt-0.5 leading-snug ${
              attr.status === "conflict" ? "text-amber-700 font-medium" :
              attr.status === "missing"  ? "text-red-600 font-medium"   :
              "text-kyc-neutral-700"
            }`}>{attr.value}</p>
          </div>
          <div className="shrink-0 mt-0.5">{statusTag}</div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <SourceBadge source={attr.source} />
          {attr.lastUpdated && <span className="text-[9px] text-kyc-neutral-400">Updated {attr.lastUpdated}</span>}
        </div>
      </div>

      {/* Confidence */}
      <div className="shrink-0 px-3 py-2.5 border-b border-kyc-neutral-100">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">Confidence</p>
          <span className="text-[9px] font-semibold px-1.5 py-0 rounded-full border" style={confBadgeStyle}>
            {reasoning.confidence}%
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
          <div className="h-1 rounded-full" style={{ width: `${reasoning.confidence}%`, background: confColor }} />
        </div>
        <p className="text-[9px] text-kyc-neutral-400 mt-1">
          {reasoning.evidenceSources.length} source{reasoning.evidenceSources.length !== 1 ? "s" : ""} · {reasoning.reasoningSteps.length} reasoning steps
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 min-h-0">

        {/* Why this was selected */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Why this was selected</p>
          <p className="text-[10.5px] text-kyc-neutral-700 leading-relaxed">{reasoning.whySelected}</p>
        </div>

        {/* Reasoning steps */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Reasoning steps</p>
          <ol className="space-y-2">
            {reasoning.reasoningSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="shrink-0 w-[15px] h-[15px] rounded-full flex items-center justify-center text-[8px] font-bold border mt-0.5"
                  style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-500)", background: "var(--color-neutral-050)" }}
                >
                  {i + 1}
                </span>
                <p className="text-[10.5px] text-kyc-neutral-700 leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Evidence reviewed */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Evidence reviewed</p>
          <div className="space-y-1">
            {reasoning.evidenceSources.map((ev, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 border" style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}>
                <FileText size={9} className="text-kyc-neutral-400 shrink-0" aria-hidden />
                <p className="text-[10px] text-kyc-neutral-700">{ev}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {attr.notes && (
          <div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1">Notes</p>
            <p className="text-[10.5px] text-kyc-neutral-700 leading-snug">{attr.notes}</p>
          </div>
        )}

        {/* Source system */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500 mb-1.5">Source system</p>
          <div className="flex items-center gap-2 px-2.5 py-2 border" style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}>
            <SourceBadge source={attr.source} />
            <p className="text-[9.5px] text-kyc-neutral-600 leading-snug flex-1">
              {attr.source === "CRM"         && "Salesforce CRM — internal client data"}
              {attr.source === "Forge"       && "KPMG Forge — KYC workflow & documents"}
              {attr.source === "Third Party" && "Refinitiv / D&B / OFAC — external vendors"}
            </p>
            <ExternalLink size={9} className="shrink-0 text-kyc-neutral-400" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Child view card → AttrRow bridge ────────────────────────────
function cardToAttr(card: CardData, colId: string): AttrRow | null {
  const attrs = colId === "root" ? ROOT_ATTRS : (ENTITY_ATTRS[colId] ?? []);
  return attrs.find(a => a.label === card.title) ?? null;
}

// ─── Child-mode card detail popup ────────────────────────────────
interface CardData {
  title: string;
  name: string;
  subtitle: string;
  source: string;
  discrepancy: boolean;
  docExcerpt?: {
    docTitle: string;
    lines: { text: string; highlight?: boolean; conflict?: boolean }[];
    conflictNote?: string;
  };
}
type CardPopup = CardData | null;

function CardDetailPopup({ card, onClose }: { card: NonNullable<CardPopup>; onClose: () => void }) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [docExpanded, setDocExpanded] = useState(false);

  const confidence = card.discrepancy ? 71 : 94;
  const sourceCount = card.discrepancy ? 3 : 2;
  const stepCount = 3;

  const whySelected = card.discrepancy
    ? `An inconsistency was detected between "${card.source}" and a linked record. This attribute requires analyst review before it can be validated.`
    : `The recorded value was confirmed against "${card.source}" and cross-referenced against internal policy requirements. All checks passed.`;

  const reasoningSteps = card.discrepancy
    ? [
        `Attribute located in "${card.source}" and cross-referenced against linked entity records.`,
        `Discrepancy detected — value differs from a corresponding record in a linked document.`,
        `Exception flagged — confidence reduced to ${confidence}% due to cross-record discrepancy. Analyst resolution required.`,
      ]
    : [
        `Attribute located in "${card.source}" and cross-referenced against KYC policy requirements.`,
        `No discrepancies detected across linked entity records. Data consistency confirmed at source.`,
        `Validation concluded — attribute verified with ${confidence}% confidence based on source reliability.`,
      ];

  const evidenceSources = card.discrepancy
    ? [`${card.source} — conflicting source value`, `Linked entity record — alternate value detected`, `KYC policy reference`]
    : [`${card.source} — primary source`, `Internal policy cross-reference`];

  const confStyle = card.discrepancy
    ? { bg: "var(--color-yellow-000)", border: "var(--color-yellow-200)", text: "var(--color-yellow-800)", bar: "var(--color-yellow-500)" }
    : { bg: "var(--color-green-000)",  border: "var(--color-green-200)",  text: "var(--color-green-700)",  bar: "var(--color-green-500)" };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div
        className="relative bg-white shadow-2xl border border-kyc-neutral-200 w-[420px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ borderRadius: "var(--corner-medium)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Blue accent bar */}
        <div className="h-1 w-full shrink-0" style={{ background: "var(--color-dark-blue-600)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-kyc-neutral-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-800">{card.title}</span>
            {card.discrepancy ? <ConflictTag /> : <VerifiedChip />}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ── Agent Reasoning — PRIMARY ── */}
          <div className="px-4 py-3 border-b border-kyc-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-kyc-neutral-500 shrink-0" aria-hidden />
                <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">Agent Reasoning</p>
              </div>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                style={{ background: confStyle.bg, borderColor: confStyle.border, color: confStyle.text }}
              >
                {confidence}% confidence
              </span>
            </div>

            {/* Confidence bar */}
            <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "var(--color-neutral-100)" }}>
              <div className="h-1 rounded-full" style={{ width: `${confidence}%`, background: confStyle.bar }} />
            </div>
            <p className="text-[9px] text-kyc-neutral-400 mb-3">
              Validated against {sourceCount} source{sourceCount !== 1 ? "s" : ""} · Reasoned in {stepCount} steps
            </p>

            {/* Why selected */}
            <p className="text-[10.5px] text-kyc-neutral-700 leading-relaxed">{whySelected}</p>

            {/* Expandable reasoning steps */}
            <button
              className="mt-3 flex items-center gap-1 text-[9px] font-semibold text-ds-dark-blue-600 hover:text-ds-dark-blue-800 transition-colors"
              onClick={() => setReasoningExpanded(r => !r)}
              aria-expanded={reasoningExpanded}
            >
              {reasoningExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              {reasoningExpanded ? "Hide" : "View"} reasoning steps
            </button>

            {reasoningExpanded && (
              <ol className="mt-2 space-y-1.5">
                {reasoningSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="shrink-0 w-[15px] h-[15px] rounded-full flex items-center justify-center text-[8px] font-bold border mt-0.5"
                      style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-500)", background: "var(--color-neutral-050)" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[10px] text-kyc-neutral-700 leading-snug">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* ── Evidence reviewed ── */}
          <div className="px-4 py-3 border-b border-kyc-neutral-200">
            <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Evidence reviewed</p>
            <div className="space-y-1">
              {evidenceSources.map((ev, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 border" style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}>
                  <FileText size={9} className="text-kyc-neutral-400 shrink-0" aria-hidden />
                  <p className="text-[10px] text-kyc-neutral-700">{ev}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Entity context — secondary ── */}
          <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-kyc-neutral-200">
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Name</p>
              <p className="text-[12px] font-semibold text-gray-800">{card.name}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Title / Role</p>
              <p className="text-[12px] text-gray-700">{card.subtitle}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Source</p>
              <div className="flex items-center gap-2">
                <SourcePill label={card.source} />
                <span className="text-[9px] text-kyc-neutral-400">{card.discrepancy ? "— discrepancy detected" : "— primary source"}</span>
              </div>
            </div>
          </div>

          {/* ── Source document preview — collapsible, secondary ── */}
          {card.docExcerpt && (
            <div className="px-4 py-3">
              <button
                className="w-full flex items-center justify-between mb-2"
                onClick={() => setDocExpanded(d => !d)}
                aria-expanded={docExpanded}
              >
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Source Document Preview</p>
                {docExpanded ? <ChevronDown size={10} className="text-gray-400" /> : <ChevronRight size={10} className="text-gray-400" />}
              </button>
              {docExpanded && (
                <>
                  <div className="border border-kyc-neutral-200 overflow-hidden" style={{ borderRadius: "var(--corner-small)" }}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-kyc-neutral-200">
                      <FileText size={11} className="text-gray-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-gray-600 truncate flex-1">{card.docExcerpt.docTitle}</span>
                      <button
                        className="inline-flex items-center gap-1 text-[9px] text-kyc-neutral-500 hover:text-kyc-neutral-800 transition-colors shrink-0"
                        aria-label="Open in source system"
                      >
                        <ExternalLink size={9} /> Open in source system
                      </button>
                    </div>
                    <div className="px-3 py-2.5 bg-white font-mono text-[10px] leading-relaxed">
                      {card.docExcerpt.lines.map((line, i) => (
                        <div
                          key={i}
                          className={`px-1 -mx-1 ${
                            line.conflict  ? "bg-amber-50 border-l-2 border-amber-400 pl-2 text-amber-800 font-semibold" :
                            line.highlight ? "bg-blue-50 text-blue-900" :
                            "text-gray-500"
                          }`}
                        >
                          {line.text || "\u00A0"}
                          {line.conflict && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1 py-0 rounded-full align-middle">
                              <AlertTriangle size={7} /> conflict
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {card.docExcerpt.conflictNote && (
                    <div className="mt-2 flex items-start gap-1.5 px-2.5 py-2 bg-amber-50 border border-amber-200" style={{ borderRadius: "var(--corner-extra-small)" }}>
                      <AlertTriangle size={11} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 leading-snug">{card.docExcerpt.conflictNote}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Child view canvas data ───────────────────────────────────────
const columns: { id: string; x: number; cx: number; entityTitle: string; cards: CardData[] }[] = [
  {
    id: "institutional", x: 30, cx: 155, entityTitle: "BlackRock Institutional",
    cards: [
      {
        title: "Authorized Signatory", name: "Sarah Williams", subtitle: "CEO, Global Equity Fund",
        source: "Fund Charter", discrepancy: true,
        docExcerpt: {
          docTitle: "Fund Charter — BlackRock Institutional Trust Co.",
          lines: [
            { text: "Section 4.2 — Authorized Signatories" },
            { text: "" },
            { text: "The following individuals are authorized to execute" },
            { text: "binding agreements on behalf of the Fund:" },
            { text: "" },
            { text: "  Name:   Sarah Williams", highlight: true },
            { text: "  Title:  CEO, Global Equity Fund", conflict: true },
            { text: "  Entity: BlackRock Institutional Trust Co." },
          ],
          conflictNote: "Title differs from \"CEO\" found in Corporate Filing (BlackRock Advisors)",
        },
      },
      { title: "Beneficial Owners", name: "BlackRock Inc.", subtitle: ">25% ownership", source: "Ownership Register", discrepancy: false },
      { title: "Attribute Name",    name: "Lorem Ipsum",   subtitle: "Title goes here",   source: "Lorem Ipsum",        discrepancy: false },
    ],
  },
  {
    id: "advisors", x: 420, cx: 545, entityTitle: "BlackRock Advisors",
    cards: [
      {
        title: "Authorized Signatory", name: "Sarah Williams", subtitle: "CEO",
        source: "Corporate Filing", discrepancy: true,
        docExcerpt: {
          docTitle: "Form ADV Part 1 — BlackRock Advisors LLC",
          lines: [
            { text: "Item 1A — Identifying Information" },
            { text: "" },
            { text: "Authorized representatives of the registrant:" },
            { text: "" },
            { text: "  Name:   Sarah Williams", highlight: true },
            { text: "  Title:  CEO", conflict: true },
            { text: "  CRD#:   BR-ADV-8812-US" },
          ],
          conflictNote: "Title \"CEO\" conflicts with \"CEO, Global Equity Fund\" in Fund Charter (BlackRock Institutional)",
        },
      },
      { title: "Beneficial Owners", name: "BlackRock Inc.", subtitle: ">25% ownership", source: "Ownership Register", discrepancy: false },
      { title: "Attribute Name",    name: "Lorem Ipsum",   subtitle: "Title goes here",   source: "Lorem Ipsum",        discrepancy: false },
    ],
  },
];

// ─── Canvas geometry ──────────────────────────────────────────────
const CANVAS_W = 700;
const COL_W    = 250;
const L_CX     = 155; const R_CX = 545; const MID_CX = 350;
const ROOT_Y = 24; const ROOT_W = 300; const ROOT_H = 90;
const ROOT_X = MID_CX - ROOT_W / 2; const ROOT_BOT = ROOT_Y + ROOT_H;
const BRANCH_Y = 135;
const ENT_LABEL_Y = 142; const ENT_Y = 154; const ENT_H = 52; const ENT_BOT = ENT_Y + ENT_H;
const CARD_GAP = 10;
const C1_Y = ENT_BOT + CARD_GAP; const C1_H = 44; const C1_BOT = C1_Y + C1_H;
const C2_Y = C1_BOT + CARD_GAP;  const C2_H = 44; const C2_BOT = C2_Y + C2_H;
const C3_Y = C2_BOT + CARD_GAP;  const C3_H = 44; const C3_BOT = C3_Y + C3_H;
const CHILD_CANVAS_H = C3_BOT + 40;
const CARD_YS = [C1_Y, C2_Y, C3_Y];

// ─── Child View ───────────────────────────────────────────────────
function ChildView({ inspectParent, activeDrawer, onAttrClick }: { inspectParent: (id: string) => void; activeDrawer: string | null; onAttrClick?: (a: AttrRow) => void }) {
  const [activeCard, setActiveCard] = useState<CardPopup>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loadingNode, setLoadingNode] = useState<string | null>(null);

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingNode) return;
    setLoadingNode(id);
    setTimeout(() => { setLoadingNode(null); inspectParent(id); }, 320);
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CHILD_CANVAS_H }}>
      <svg style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }} width={CANVAS_W} height={CHILD_CANVAS_H}>
        <path d={`M ${MID_CX} ${ROOT_BOT} L ${MID_CX} ${BRANCH_Y} L ${L_CX} ${BRANCH_Y} L ${L_CX} ${ENT_Y}`} fill="none" stroke="#c8cdd9" strokeWidth="1" />
        <path d={`M ${MID_CX} ${BRANCH_Y} L ${R_CX} ${BRANCH_Y} L ${R_CX} ${ENT_Y}`} fill="none" stroke="#c8cdd9" strokeWidth="1" />
        {columns.map(col => (
          <g key={col.id}>
            <line x1={col.cx} y1={ENT_BOT} x2={col.cx} y2={C1_Y} stroke="#c8cdd9" strokeWidth="1" />
            <line x1={col.cx} y1={C1_BOT}  x2={col.cx} y2={C2_Y} stroke="#c8cdd9" strokeWidth="1" />
            <line x1={col.cx} y1={C2_BOT}  x2={col.cx} y2={C3_Y} stroke="#c8cdd9" strokeWidth="1" />
          </g>
        ))}
      </svg>

      <div style={{ position: "absolute", top: 8, left: 0, width: CANVAS_W, display: "flex", justifyContent: "center" }}>
        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">DRG Parent</span>
      </div>
      <div
        style={{
          position: "absolute", top: ROOT_Y, left: ROOT_X, width: ROOT_W, height: ROOT_H,
          background: activeDrawer === "root" || hoveredNode === "root" ? "var(--color-dark-blue-000)" : "#ffffff",
          border: activeDrawer === "root" ? "2px solid var(--color-dark-blue-400)" : hoveredNode === "root" ? "1.5px solid var(--color-dark-blue-300)" : "1px solid var(--color-neutral-300)",
          boxShadow: activeDrawer === "root" ? "0 0 0 3px var(--color-dark-blue-100)" : "none",
          transition: "background 0.12s, border 0.12s",
          opacity: loadingNode && loadingNode !== "root" ? 0.5 : 1,
        }}
        className="tree-node rounded-lg px-4 py-3 flex flex-col justify-center gap-1 cursor-pointer"
        onClick={e => handleNodeClick("root", e)}
        onMouseEnter={() => setHoveredNode("root")}
        onMouseLeave={() => setHoveredNode(null)}
        role="button" aria-label="Inspect BlackRock DRG Group" aria-pressed={activeDrawer === "root"}
      >
        <div className="flex items-center justify-between">
          <span className="text-kyc-neutral-800 font-semibold text-[14px]">BlackRock DRG Group</span>
          {loadingNode === "root"
            ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "var(--color-dark-blue-500)" }} />
            : <CheckCircle2 size={24} strokeWidth={2} className="text-ds-green-700 shrink-0" aria-label="Verified" />}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex gap-2">
            <span className="text-[10px] text-kyc-neutral-600">Asset Mgmt</span>
            <span className="text-[10px] text-kyc-neutral-600">12 entities</span>
          </div>
        </div>
      </div>

      {columns.map(col => (
        <div key={col.id}>
          <div
            style={{
              position: "absolute", top: ENT_Y, left: col.x, width: COL_W, height: ENT_H,
              background: activeDrawer === col.id || hoveredNode === col.id ? "var(--color-dark-blue-000)" : "#ffffff",
              border: activeDrawer === col.id ? "2px solid var(--color-dark-blue-400)" : hoveredNode === col.id ? "1.5px solid var(--color-dark-blue-300)" : "1px solid var(--color-neutral-300)",
              boxShadow: activeDrawer === col.id ? "0 0 0 3px var(--color-dark-blue-100)" : "none",
              transition: "background 0.12s, border 0.12s",
              opacity: loadingNode && loadingNode !== col.id ? 0.5 : 1,
            }}
            className="tree-node rounded-lg px-3 flex items-center justify-between cursor-pointer"
            onClick={e => handleNodeClick(col.id, e)}
            onMouseEnter={() => setHoveredNode(col.id)}
            onMouseLeave={() => setHoveredNode(null)}
            role="button" aria-label={`Inspect ${col.entityTitle}`} aria-pressed={activeDrawer === col.id}
          >
            <span className="text-[12px] font-semibold text-slate-600">{col.entityTitle}</span>
            {loadingNode === col.id
              ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "var(--color-dark-blue-500)" }} />
              : <CheckCircle2 size={24} strokeWidth={2} className="text-ds-green-700 shrink-0" aria-label="Verified" />}
          </div>
          {col.cards.map((card, ci) => {
            const cardKey = `${col.id}-card-${ci}`;
            return (
            <div
              key={ci}
              style={{
                position: "absolute", top: CARD_YS[ci], left: col.x, width: COL_W,
                background: hoveredNode === cardKey ? (card.discrepancy ? "rgba(239,68,68,0.04)" : "var(--color-dark-blue-000)") : "#ffffff",
                border: hoveredNode === cardKey
                  ? (card.discrepancy ? "1.5px solid var(--color-red-400)" : "1.5px solid var(--color-dark-blue-300)")
                  : (card.discrepancy ? "1px solid var(--color-red-700)" : "1px solid var(--color-neutral-300)"),
                transition: "background 0.12s, border 0.12s",
              }}
              className="tree-node rounded-lg px-3 py-2.5 cursor-pointer"
              onMouseEnter={() => setHoveredNode(cardKey)}
              onMouseLeave={() => setHoveredNode(null)}
              role="button" aria-label={`View reasoning for ${card.title}`}
              onClick={e => {
                e.stopPropagation();
                const matched = cardToAttr(card, col.id);
                if (matched && onAttrClick) { onAttrClick(matched); }
                else { setActiveCard(card); }
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-gray-700">{card.title}</span>
                {card.discrepancy
                  ? <AlertTriangle size={24} strokeWidth={2} className="shrink-0" style={{ color: "var(--color-red-700)" }} aria-label="Conflict" />
                  : <CheckCircle2 size={24} strokeWidth={2} className="text-ds-green-700 shrink-0" aria-label="Verified" />
                }
              </div>
            </div>
          );
          })}
        </div>
      ))}
      {activeCard && <CardDetailPopup card={activeCard} onClose={() => setActiveCard(null)} />}
    </div>
  );
}

// ─── Attribute group section ──────────────────────────────────────
function AttrGroupSection({
  groupName, attrs, sourceFilter, onAttrClick, selectedAttr,
}: {
  groupName: string;
  attrs: AttrRow[];
  sourceFilter: DataSource | "All";
  onAttrClick: (attr: AttrRow) => void;
  selectedAttr?: AttrRow | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const visible = sourceFilter === "All" ? attrs : attrs.filter(a => a.source === sourceFilter);
  if (visible.length === 0) return null;

  const issues = visible.filter(a => a.status === "conflict" || a.status === "missing").length;

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-kyc-neutral-50 border-y border-kyc-neutral-200 hover:bg-kyc-neutral-100 transition-colors"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={10} className="text-kyc-neutral-500 shrink-0" /> : <ChevronDown size={10} className="text-kyc-neutral-500 shrink-0" />}
        <span className="text-[9px] font-bold uppercase tracking-widest text-kyc-neutral-600 flex-1 text-left">{groupName}</span>
        <span className="text-[9px] text-kyc-neutral-500">{visible.length}</span>
        {issues > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={7} />{issues}
          </span>
        )}
      </button>

      {/* Attribute rows */}
      {!collapsed && (
        <div className="divide-y divide-kyc-neutral-100">
          {visible.map((attr, i) => {
            const isSelected = selectedAttr?.label === attr.label && selectedAttr?.group === attr.group;
            return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2 cursor-pointer transition-colors"
              style={{
                borderLeft: isSelected ? "2px solid var(--color-dark-blue-400)" : "2px solid transparent",
                background: isSelected ? "var(--color-dark-blue-000)"
                  : attr.status === "conflict" ? "rgba(245,158,11,0.04)"
                  : attr.status === "missing"  ? "rgba(239,68,68,0.04)" : "white",
              }}
              onClick={() => onAttrClick(attr)}
              role="button" aria-pressed={isSelected} aria-label={`View reasoning for ${attr.label}`}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = attr.status === "conflict" ? "rgba(245,158,11,0.09)" : attr.status === "missing" ? "rgba(239,68,68,0.09)" : "var(--color-neutral-050)"; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = attr.status === "conflict" ? "rgba(245,158,11,0.04)" : attr.status === "missing" ? "rgba(239,68,68,0.04)" : "white"; }}
            >
              <AttrStatusDot status={attr.status} />
              <span className={`text-[9.5px] font-semibold w-36 shrink-0 leading-tight pt-0.5 ${isSelected ? "text-ds-dark-blue-600" : "text-gray-400"}`}>{attr.label}</span>
              <span className={`text-[10px] flex-1 leading-snug min-w-0 ${
                isSelected ? "font-medium text-kyc-neutral-800" :
                attr.status === "conflict" ? "text-amber-700 font-medium" :
                attr.status === "missing"  ? "text-red-600 font-medium"   : "text-gray-700"
              }`}>{attr.value}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <SourceBadge source={attr.source} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-dark-blue-500)" }} />}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Parent View (Entity Attributes) ─────────────────────────────
function ParentView({ selectedAttr, onAttrClick }: { selectedAttr: AttrRow | null; onAttrClick: (a: AttrRow) => void }) {
  const [sourceFilter, setSourceFilter] = useState<DataSource | "All">("All");
  const allSources: (DataSource | "All")[] = ["All", "CRM", "Forge", "Third Party"];

  const renderAttrSection = (entityName: string, attrs: AttrRow[], subtitle?: string, passedSelectedAttr?: AttrRow | null) => {
    const groups = Array.from(new Set(attrs.map(a => a.group)));
    const filtered = sourceFilter === "All" ? attrs : attrs.filter(a => a.source === sourceFilter);
    const total = filtered.length;
    const issues = filtered.filter(a => a.status === "conflict" || a.status === "missing").length;

    return (
      <div className="rounded-lg overflow-hidden border border-kyc-neutral-200 mb-4">
        {/* Entity header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-kyc-neutral-200">
          <div>
            {subtitle && <p className="text-[9px] font-bold tracking-widest uppercase text-kyc-neutral-500">{subtitle}</p>}
            <p className="text-[13px] font-bold text-kyc-neutral-800">{entityName}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {issues > 0
              ? <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">{issues} issue{issues > 1 ? "s" : ""}</span>
              : <VerifiedChip />}
            <span className="text-[10px] text-kyc-neutral-500">{total} attr{total !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Groups */}
        <div>
          {groups.map(g => (
            <AttrGroupSection
              key={g}
              groupName={g}
              attrs={attrs.filter(a => a.group === g)}
              sourceFilter={sourceFilter}
              onAttrClick={onAttrClick}
              selectedAttr={passedSelectedAttr}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Source filter toolbar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-kyc-neutral-200 bg-white">
        <Filter size={10} className="text-kyc-neutral-500 shrink-0" aria-hidden="true" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-kyc-neutral-500 shrink-0">Source</span>
        <div className="flex items-center gap-1">
          {allSources.map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                sourceFilter === s
                  ? "bg-kyc-navy text-white border-kyc-navy"
                  : "border-kyc-neutral-200 text-kyc-neutral-600 hover:bg-kyc-neutral-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable attribute list */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-4 min-h-0 bg-white">

        {/* Root (DRG Parent) */}
        {renderAttrSection("BlackRock DRG Group", ROOT_ATTRS, "DRG Parent", selectedAttr)}

        {/* Entity-level */}
        <div className="grid grid-cols-1 gap-0">
          {renderAttrSection("BlackRock Institutional Trust Co.", ENTITY_ATTRS.institutional ?? [], "Entity", selectedAttr)}
          {renderAttrSection("BlackRock Advisors LLC", ENTITY_ATTRS.advisors ?? [], "Entity", selectedAttr)}
        </div>
      </div>
    </div>
  );
}

// ─── Inspect drawer (child mode → parent quick-look) ─────────────
function InspectDrawer({ id, onClose, onAttrClick }: { id: string; onClose: () => void; onAttrClick: (a: AttrRow) => void }) {
  const isRoot  = id === "root";
  const colData = columns.find(c => c.id === id);
  const name    = isRoot ? "BlackRock DRG Group" : colData?.entityTitle ?? id;
  const attrs   = isRoot ? ROOT_ATTRS : (ENTITY_ATTRS[id] ?? []);

  return (
    <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-kyc-neutral-200 bg-gray-50 shrink-0">
        <span className="text-[11px] font-semibold text-kyc-neutral-800 truncate">{name}</span>
        <button onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-700 border border-kyc-neutral-200 px-2 py-0.5 rounded hover:bg-gray-100 transition-colors">✕ Close</button>
      </div>
      <div className="overflow-y-auto flex-1">
        <div className="grid grid-cols-2 divide-x divide-kyc-neutral-200">
          {attrs.slice(0, 16).map((attr, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 border-b border-kyc-neutral-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onAttrClick(attr)}
            >
              <AttrStatusDot status={attr.status} />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase truncate">{attr.label}</p>
                <p className={`text-[11px] font-medium leading-snug ${attr.status === "conflict" ? "text-amber-700" : attr.status === "missing" ? "text-red-600" : "text-gray-700"}`}>{attr.value}</p>
              </div>
              <SourceBadge source={attr.source} />
            </div>
          ))}
        </div>
        {attrs.length > 16 && (
          <p className="text-center text-[9px] text-kyc-neutral-500 py-2">+{attrs.length - 16} more — switch to Entity Attributes for full view</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Canvas ──────────────────────────────────────────────────
export function ContentTreeCanvas({
  onViewModeChange,
  selectedAttr = null,
  onAttrSelect,
}: {
  onViewModeChange?: (mode: ViewMode) => void;
  selectedAttr?: AttrRow | null;
  onAttrSelect?: (attr: AttrRow | null) => void;
} = {}) {
  const [viewMode, setViewMode]   = useState<ViewMode>("child");
  const [tx, setTx]               = useState(0);
  const [ty, setTy]               = useState(16);
  const [scale, setScale]         = useState(0.85);
  const [drawer, setDrawer]       = useState<string | null>(null);

  const panning  = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const d = e.deltaY > 0 ? -0.08 : 0.08;
        setScale(s => Math.max(0.25, Math.min(2.5, s + d)));
      } else { setTx(x => x - e.deltaX); setTy(y => y - e.deltaY); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,a")) return;
    panning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, tx, ty };
    e.preventDefault();
  }, [tx, ty]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panning.current) return;
    setTx(panStart.current.tx + e.clientX - panStart.current.mx);
    setTy(panStart.current.ty + e.clientY - panStart.current.my);
  }, []);

  const stopPan = useCallback(() => { panning.current = false; }, []);

  const fitToContainer = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const newScale = Math.min((w - 24) / CANVAS_W, (h - 60) / CHILD_CANVAS_H, 1);
    setScale(parseFloat(newScale.toFixed(3)));
    setTx(Math.round((w - CANVAS_W * newScale) / 2));
    setTy(16);
  }, []);

  useEffect(() => {
    fitToContainer();
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { fitToContainer(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToContainer]);

  const switchMode = (m: ViewMode) => { setViewMode(m); setDrawer(null); onViewModeChange?.(m); };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">

      {/* ── Toolbar (child mode only) ── */}
      {viewMode === "child" && (
        <div className="shrink-0 flex items-center justify-end gap-1 px-3 py-1.5 bg-white border-b border-kyc-neutral-200 z-20">
          <button onClick={() => setScale(s => Math.min(2.5, parseFloat((s + 0.15).toFixed(2))))} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 border border-kyc-neutral-200 bg-white rounded" title="Zoom in"><Plus size={10} /></button>
          <button onClick={() => setScale(s => Math.max(0.25, parseFloat((s - 0.15).toFixed(2))))} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 border border-kyc-neutral-200 bg-white rounded" title="Zoom out"><Minus size={10} /></button>
          <button onClick={fitToContainer} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 border border-kyc-neutral-200 bg-white rounded" title="Reset"><Maximize2 size={10} /></button>
          <span className="text-[10px] text-gray-400 w-8 text-center">{Math.round(scale * 100)}%</span>
        </div>
      )}

      {/* ── Content + Reasoning Drawer (flex row) ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Main content column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {viewMode === "parent" ? (
            <ParentView selectedAttr={selectedAttr} onAttrClick={attr => onAttrSelect?.(attr)} />
          ) : (
            <>
              <div
                ref={outerRef}
                className="relative overflow-hidden select-none bg-white"
                style={{ flex: drawer ? "0 0 auto" : "1 1 100%", height: drawer ? "55%" : undefined, cursor: panning.current ? "grabbing" : "grab", transition: "height 0.2s" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopPan}
                onMouseLeave={stopPan}
                onClick={() => setDrawer(null)}
              >
                <div style={{ position: "absolute", transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
                  <ChildView
                    inspectParent={id => setDrawer(prev => prev === id ? null : id)}
                    activeDrawer={drawer}
                    onAttrClick={attr => onAttrSelect?.(attr)}
                  />
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] text-gray-400 pointer-events-none">
                  Drag to pan · Ctrl+scroll to zoom · Click a node to inspect
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 pointer-events-none">
                  {Math.round(scale * 100)}%
                </div>
              </div>

              {/* Inspect drawer */}
              {drawer && (
                <div className="border-t border-kyc-neutral-200 bg-white flex flex-col" style={{ height: "45%", minHeight: 180, flexShrink: 0 }}>
                  <InspectDrawer id={drawer} onClose={() => setDrawer(null)} onAttrClick={attr => onAttrSelect?.(attr)} />
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
