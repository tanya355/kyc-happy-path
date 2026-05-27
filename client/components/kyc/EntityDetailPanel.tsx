import { useState, useEffect } from "react";
import {
  X, CheckCircle2, AlertTriangle, FileText, Sparkles,
  Clock, ChevronDown, ChevronRight, ExternalLink, AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";
import { AttrRow, ENTITY_ATTRS, getAttrReasoning } from "./ContentTreeCanvas";

// ─── Types ────────────────────────────────────────────────────────

interface EntityDetailPanelProps {
  entityName: string;
  caseNumber: string;
  onClose: () => void;
}

type TabId = "overview" | "attributes" | "documents" | "reasoning" | "audit";

// ─── Per-entity static metadata ───────────────────────────────────

interface EntityMeta {
  key: string;
  risk: string;
  cipStatus: string;
  openExceptions: number;
  kycStatus: string;
  entityType: string;
  jurisdiction: string;
  registration: string;
  lastKycReview: string;
  nextReviewDue: string;
  amlPolicy: string;
  confidence: number;
  riskLevel: "elevated" | "moderate" | "low";
  contextSummary: string;
  reasoningSteps: string[];
  keySignals: { label: string; kind: "conflict" | "clear" | "warning" }[];
  evidenceBase: string[];
}

const ENTITY_DETAIL_META: Record<string, EntityMeta> = {
  "BlackRock Advisors": {
    key: "advisors",
    risk: "Elevated", riskLevel: "elevated",
    cipStatus: "Incomplete — title mismatch",
    openExceptions: 1, kycStatus: "In Review",
    entityType: "Registered Investment Adviser",
    jurisdiction: "USA", registration: "SEC 801-47710",
    lastKycReview: "2024-01-10", nextReviewDue: "2025-01-10",
    amlPolicy: "AML-POL-2024-v3",
    confidence: 90,
    contextSummary: "BlackRock Advisors LLC is elevated due to an authorized signatory title discrepancy between the Form ADV filing and the corporate charter of the linked entity BlackRock Institutional. Identity is confirmed via matching tax ID; however, the inconsistency requires analyst resolution before the case can be cleared.",
    reasoningSteps: [
      "Cross-referenced authorized signatory records across BlackRock Advisors LLC and BlackRock Institutional Trust Co. — title mismatch detected.",
      "Validated underlying identity via tax ID and contact data — no substantive identity conflict found.",
      "Assessed applicable FATF guidelines: title variation at different entity levels is permissible when identity is independently confirmed.",
      "Flagged for analyst review to formally document resolution rationale before exception closure.",
    ],
    keySignals: [
      { label: "Authorized Signatory Conflict", kind: "conflict" },
      { label: "Sanctions Screening: Cleared", kind: "clear" },
      { label: "PEP Screening: Clear", kind: "clear" },
      { label: "Form ADV Filed — Current", kind: "clear" },
    ],
    evidenceBase: ["Form ADV Part 1 — BlackRock Advisors LLC", "Corporate Filing — Signatory Registry", "Refinitiv Sanctions Database (Nov 2024)"],
  },
  "BlackRock Institutional": {
    key: "institutional",
    risk: "Elevated", riskLevel: "elevated",
    cipStatus: "Incomplete — 1 attribute pending",
    openExceptions: 3, kycStatus: "In Review",
    entityType: "Institutional Investor",
    jurisdiction: "USA", registration: "CRD-INST-8841",
    lastKycReview: "2023-09-14", nextReviewDue: "2024-09-14 (overdue)",
    amlPolicy: "AML-POL-2024-v3",
    confidence: 95,
    contextSummary: "BlackRock Institutional Trust Co. is elevated due to an overdue KYC review cycle and a missing Offering Memorandum required for full CIP validation. Additionally, the authorized signatory title differs from the cross-entity record at BlackRock Advisors LLC. Three open exceptions are pending resolution.",
    reasoningSteps: [
      "KYC review cycle is 7 months overdue — entity flagged as elevated pending completion of annual refresh.",
      "Offering Memorandum not received — one CIP attribute cannot be validated without this document.",
      "Authorized signatory title 'CEO, Global Equity Fund' does not match 'CEO' in the linked Form ADV filing.",
      "All other CIP and CDD attributes validated against Fund Charter, Signatory Registry, and third-party screening databases.",
    ],
    keySignals: [
      { label: "KYC Review Overdue (7 months)", kind: "conflict" },
      { label: "Offering Memorandum Missing", kind: "conflict" },
      { label: "Authorized Signatory Conflict", kind: "conflict" },
      { label: "Sanctions Screening: Cleared", kind: "clear" },
    ],
    evidenceBase: ["Fund Charter — BlackRock Institutional Trust Co.", "Refinitiv Sanctions Database (Nov 2024)", "KPMG Forge — KYC workflow records"],
  },
  "Entity 13": {
    key: "entity13",
    risk: "Moderate", riskLevel: "moderate",
    cipStatus: "In Progress",
    openExceptions: 1, kycStatus: "Not Started",
    entityType: "Investment Entity",
    jurisdiction: "European Union", registration: "EU-ENT-29107",
    lastKycReview: "2022-11-01", nextReviewDue: "2023-11-01 (overdue)",
    amlPolicy: "AML-POL-2024-v3",
    confidence: 70,
    contextSummary: "Entity 13 has a pending validation exception detected during automated attribute processing. The AI model has moderate confidence in its assessment and human sign-off is required per compliance protocol before the case can advance.",
    reasoningSteps: [
      "Automated processing flagged a data inconsistency in the entity registry extract (Pg. 7).",
      "Model confidence is 70% — inconsistency is likely a formatting or labeling artifact rather than a substantive conflict.",
      "No adverse media or sanctions hits found against Entity 13 in external screening databases.",
      "Human confirmation required per compliance protocol before exception can be marked resolved.",
    ],
    keySignals: [
      { label: "Data Inconsistency Flagged", kind: "warning" },
      { label: "Moderate Model Confidence (70%)", kind: "warning" },
      { label: "No Adverse Media", kind: "clear" },
      { label: "Sanctions: Cleared", kind: "clear" },
    ],
    evidenceBase: ["Entity Registry Extract — Pg. 7", "OFAC Sanctions List (current)", "Internal processing log"],
  },
};

// ─── Per-entity document list ─────────────────────────────────────

interface DocRow {
  name: string;
  type: string;
  source: string;
  date: string;
  status: "verified" | "missing" | "pending";
}

const ENTITY_DOCS: Record<string, DocRow[]> = {
  "BlackRock Advisors": [
    { name: "Form ADV Part 1 & 2",          type: "Regulatory Filing",   source: "Third Party",  date: "2024-03-15", status: "verified" },
    { name: "Certificate of Incorporation",  type: "Corporate Charter",   source: "Forge",        date: "2024-09-01", status: "verified" },
    { name: "Board Resolution",              type: "Internal Record",     source: "Forge",        date: "2024-10-15", status: "verified" },
    { name: "UBO Declaration",               type: "Declaration",         source: "Forge",        date: "2025-11-15", status: "verified" },
    { name: "Certificate of Incumbency",     type: "Corporate Document",  source: "Forge",        date: "2026-01-10", status: "verified" },
    { name: "Offering Memorandum",           type: "Fund Document",       source: "Forge",        date: "—",          status: "missing" },
  ],
  "BlackRock Institutional": [
    { name: "Fund Charter",                  type: "Corporate Charter",   source: "Forge",        date: "2024-09-01", status: "verified" },
    { name: "Signatory Registry",            type: "Internal Record",     source: "Forge",        date: "2025-04-14", status: "verified" },
    { name: "Board Resolution",              type: "Internal Record",     source: "Forge",        date: "2024-10-15", status: "verified" },
    { name: "Certificate of Incorporation",  type: "Corporate Charter",   source: "Forge",        date: "2024-09-01", status: "verified" },
    { name: "UBO Declaration",               type: "Declaration",         source: "Forge",        date: "2025-11-15", status: "verified" },
    { name: "Offering Memorandum",           type: "Fund Document",       source: "Forge",        date: "—",          status: "missing" },
  ],
  "Entity 13": [
    { name: "Corporate Filing",              type: "Regulatory Filing",   source: "Third Party",  date: "2024-01-15", status: "verified" },
    { name: "Entity Registry Extract",       type: "Regulatory Extract",  source: "Third Party",  date: "2024-11-01", status: "pending" },
    { name: "UBO Declaration",               type: "Declaration",         source: "Forge",        date: "2023-06-10", status: "verified" },
  ],
};

// Hardcoded audit events per entity
const ENTITY_AUDIT: Record<string, { time: string; title: string; detail: string; kind: "info" | "flag" | "agent" | "submit" }[]> = {
  "BlackRock Advisors": [
    { time: "2h ago", kind: "info",   title: "Review session opened",             detail: "Case KYC-28821 loaded for analyst review." },
    { time: "1h 44m ago", kind: "flag",  title: "Exception flagged",              detail: "Authorized Signatory title conflict detected across entity records." },
    { time: "1h 30m ago", kind: "agent", title: "Agent reasoning generated",      detail: "Model assessed title conflict with 90% confidence. Resolution options surfaced." },
    { time: "52m ago",  kind: "info",   title: "Form ADV reviewed",               detail: "Analyst opened Form ADV Part 1 for signatory verification." },
    { time: "14m ago",  kind: "agent",  title: "Agent Review completed",          detail: "Agent assessed analyst decisions and confirmed resolution rationale." },
  ],
  "BlackRock Institutional": [
    { time: "2h ago",   kind: "info",   title: "Review session opened",            detail: "Case KYC-28834 loaded for analyst review." },
    { time: "1h 52m ago", kind: "flag", title: "Exception flagged: CIP Incomplete", detail: "Offering Memorandum not received — CIP attribute unvalidatable." },
    { time: "1h 40m ago", kind: "flag", title: "Exception flagged: Review overdue", detail: "Annual KYC review cycle is 7 months overdue." },
    { time: "1h 20m ago", kind: "agent","title": "Agent reasoning generated",      detail: "Model assessed all 3 exceptions with 95% confidence." },
    { time: "30m ago",  kind: "info",   title: "Document request queued",          detail: "Offering Memorandum request added to Reach Outs queue." },
  ],
  "Entity 13": [
    { time: "2h ago",   kind: "info",   title: "Review session opened",            detail: "Case KYC-29107 loaded for analyst review." },
    { time: "1h 48m ago", kind: "flag", title: "Data inconsistency flagged",       detail: "Automated processing flagged attribute inconsistency in entity registry extract." },
    { time: "1h 35m ago", kind: "agent","title": "Agent reasoning generated",      detail: "Model assessed inconsistency at 70% confidence. Human sign-off required." },
    { time: "1h 10m ago", kind: "info", title: "Entity Registry Extract reviewed", detail: "Analyst reviewed Pg. 7 of entity registry extract." },
  ],
};

// ─── Small atoms ─────────────────────────────────────────────────

function StatusChip({ label, kind }: { label: string; kind: "verified" | "conflict" | "missing" | "pending" | "in-review" }) {
  const cfg = {
    verified:   { bg: "var(--color-green-000)",  border: "var(--color-green-200)",  color: "var(--color-green-700)" },
    conflict:   { bg: "var(--color-red-000)",    border: "var(--color-red-200)",    color: "var(--color-red-700)" },
    missing:    { bg: "var(--color-red-000)",    border: "var(--color-red-200)",    color: "var(--color-red-700)" },
    pending:    { bg: "var(--color-yellow-000)", border: "var(--color-yellow-300)", color: "var(--color-yellow-800)" },
    "in-review":{ bg: "var(--color-dark-blue-000)", border: "var(--color-dark-blue-200)", color: "var(--color-dark-blue-700)" },
  }[kind];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[9px] font-semibold border" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
      {(kind === "verified") && <CheckCircle2 size={8} strokeWidth={2.5} />}
      {(kind === "conflict" || kind === "missing") && <AlertTriangle size={8} strokeWidth={2.5} />}
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-neutral-500)" }}>{children}</p>;
}

function ConfBar({ pct }: { pct: number; riskLevel?: string }) {
  const color = pct >= 85 ? "var(--color-green-500)" : pct >= 60 ? "var(--color-yellow-500)" : "var(--color-red-500)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--color-neutral-500)" }}>Model Confidence</p>
        <span className="text-[10px] font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────

function OverviewTab({ meta, attrs }: { entityName: string; meta: EntityMeta; attrs: AttrRow[] }) {
  const verified = attrs.filter(a => a.status === "verified").length;
  const conflict = attrs.filter(a => a.status === "conflict").length;
  const missing  = attrs.filter(a => a.status === "missing").length;

  const statsGrid = [
    { label: "Risk",            value: meta.risk,           kind: meta.riskLevel === "elevated" ? "conflict" : meta.riskLevel === "moderate" ? "pending" : "verified" },
    { label: "CIP Status",      value: meta.cipStatus,      kind: meta.cipStatus.startsWith("In") ? "pending" : meta.cipStatus.startsWith("Incomplete") ? "conflict" : "verified" },
    { label: "Open Exceptions", value: String(meta.openExceptions), kind: meta.openExceptions > 0 ? "conflict" : "verified" },
    { label: "KYC Status",      value: meta.kycStatus,      kind: "in-review" as const },
  ];

  const contextRows = [
    ["Entity Type",       meta.entityType],
    ["Jurisdiction",      meta.jurisdiction],
    ["Registration",      meta.registration],
    ["Last KYC Review",   meta.lastKycReview],
    ["Next Review Due",   meta.nextReviewDue],
    ["AML Policy",        meta.amlPolicy],
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div>
        <SectionLabel>Key Status</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {statsGrid.map(s => (
            <div key={s.label} className="px-3 py-3 border flex flex-col gap-1.5" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}>
              <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--color-neutral-500)" }}>{s.label}</p>
              <StatusChip label={s.value} kind={s.kind as any} />
            </div>
          ))}
        </div>
      </div>

      {/* Data quality */}
      <div>
        <SectionLabel>Attribute Data Quality</SectionLabel>
        <div className="flex items-center gap-3 px-4 py-3 border" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-green-500)" }} />
            <span className="text-[11px] font-semibold" style={{ color: "var(--color-green-700)" }}>{verified} Verified</span>
          </div>
          <div className="w-px h-4 bg-kyc-neutral-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-red-500)" }} />
            <span className="text-[11px] font-semibold" style={{ color: "var(--color-red-700)" }}>{conflict} Conflict{conflict !== 1 ? "s" : ""}</span>
          </div>
          <div className="w-px h-4 bg-kyc-neutral-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-neutral-400)" }} />
            <span className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-600)" }}>{missing} Missing</span>
          </div>
          <div className="ml-auto text-[10px]" style={{ color: "var(--color-neutral-500)" }}>{attrs.length} total attributes</div>
        </div>
      </div>

      {/* Entity context */}
      <div>
        <SectionLabel>Entity Context</SectionLabel>
        <div className="border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
          {contextRows.map(([label, val]) => (
            <div key={label} className="flex items-start border-b last:border-0" style={{ borderColor: "var(--color-neutral-100)" }}>
              <div className="w-36 shrink-0 px-3 py-2" style={{ background: "var(--color-neutral-050)" }}>
                <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--color-neutral-500)" }}>{label}</p>
              </div>
              <div className="flex-1 px-3 py-2">
                <p className="text-[11px] font-medium" style={{ color: val.includes("overdue") ? "var(--color-red-600)" : "var(--color-neutral-800)" }}>{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Attributes ─────────────────────────────────────────────

function AttrStatusDot({ status }: { status?: string }) {
  const color = status === "conflict" ? "#f59e0b" : status === "missing" ? "#ef4444" : "#22c55e";
  return <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: color }} />;
}

function SourceBadge({ source }: { source: string }) {
  const cfg: Record<string, string> = {
    "CRM":         "bg-blue-50 text-blue-700 border-blue-200",
    "Forge":       "bg-purple-50 text-purple-700 border-purple-200",
    "Third Party": "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${cfg[source] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {source === "Third Party" ? "3rd" : source}
    </span>
  );
}

function AttrRowExpansion({ attr }: { attr: AttrRow }) {
  const r = getAttrReasoning(attr);
  const confColor = r.confidence >= 85 ? "var(--color-green-500)" : r.confidence >= 60 ? "var(--color-yellow-500)" : "var(--color-red-500)";
  return (
    <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: "var(--color-neutral-100)", background: "var(--color-neutral-050)" }}>
      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--color-neutral-500)" }}>Confidence</p>
          <span className="text-[9px] font-semibold" style={{ color: confColor }}>{r.confidence}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-200)" }}>
          <div className="h-1 rounded-full" style={{ width: `${r.confidence}%`, background: confColor }} />
        </div>
      </div>
      {/* Why selected */}
      <div>
        <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--color-neutral-500)" }}>Why this was selected</p>
        <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--color-neutral-700)" }}>{r.whySelected}</p>
      </div>
      {/* Reasoning steps */}
      <ol className="space-y-1.5">
        {r.reasoningSteps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="shrink-0 w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-bold border mt-0.5" style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-500)", background: "var(--color-neutral-100)" }}>{i + 1}</span>
            <p className="text-[10.5px] leading-snug" style={{ color: "var(--color-neutral-700)" }}>{step}</p>
          </li>
        ))}
      </ol>
      {/* Evidence */}
      <div className="space-y-1">
        {r.evidenceSources.map((ev, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 border" style={{ background: "white", borderColor: "var(--color-neutral-200)" }}>
            <FileText size={9} style={{ color: "var(--color-neutral-400)" }} />
            <p className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>{ev}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttributesTab({ attrs }: { attrs: AttrRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const groups = Array.from(new Set(attrs.map(a => a.group)));

  return (
    <div className="space-y-1">
      {groups.map(group => {
        const groupAttrs = attrs.filter(a => a.group === group);
        const issues = groupAttrs.filter(a => a.status !== "verified").length;
        return (
          <div key={group} className="border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
            <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}>
              <p className="text-[9px] font-bold tracking-widest uppercase flex-1" style={{ color: "var(--color-neutral-600)" }}>{group}</p>
              <span className="text-[9px]" style={{ color: "var(--color-neutral-400)" }}>{groupAttrs.length}</span>
              {issues > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0 rounded-full border" style={{ background: "var(--color-yellow-000)", borderColor: "var(--color-yellow-300)", color: "var(--color-yellow-800)" }}>
                  <AlertTriangle size={7} />{issues}
                </span>
              )}
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
              {groupAttrs.map((attr, i) => {
                const key = `${group}-${i}`;
                const isOpen = expanded === key;
                return (
                  <div key={i} style={{ background: attr.status === "conflict" ? "rgba(245,158,11,0.04)" : attr.status === "missing" ? "rgba(239,68,68,0.04)" : "white" }}>
                    <button
                      className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:brightness-[0.97] transition-colors"
                      onClick={() => setExpanded(isOpen ? null : key)}
                      aria-expanded={isOpen}
                    >
                      <AttrStatusDot status={attr.status} />
                      <span className="text-[9.5px] font-semibold w-36 shrink-0 leading-tight pt-0.5" style={{ color: "var(--color-neutral-500)" }}>{attr.label}</span>
                      <span className={`text-[10px] flex-1 leading-snug ${attr.status === "conflict" ? "font-medium text-amber-700" : attr.status === "missing" ? "font-medium text-red-600" : ""}`} style={attr.status === "verified" ? { color: "var(--color-neutral-700)" } : {}}>
                        {attr.value}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <SourceBadge source={attr.source} />
                        {isOpen
                          ? <ChevronDown size={10} style={{ color: "var(--color-neutral-400)" }} />
                          : <ChevronRight size={10} style={{ color: "var(--color-neutral-400)" }} />}
                      </div>
                    </button>
                    {isOpen && <AttrRowExpansion attr={attr} />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Documents ───────────────────────────────────────────────

function DocumentsTab({ docs }: { docs: DocRow[] }) {
  const statusKind = (s: DocRow["status"]) =>
    s === "verified" ? "verified" : s === "missing" ? "missing" : "pending";

  return (
    <div className="border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
      <div className="grid px-4 py-2" style={{ gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr 80px", background: "var(--color-neutral-050)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        {["Document", "Type", "Source", "Date", "Status", ""].map(h => (
          <p key={h} className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--color-neutral-500)" }}>{h}</p>
        ))}
      </div>
      <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
        {docs.map((doc, i) => (
          <div key={i} className="grid items-center px-4 py-2.5 hover:brightness-[0.98] transition-colors" style={{ gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr 80px", background: doc.status === "missing" ? "rgba(239,68,68,0.03)" : "white" }}>
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={12} style={{ color: doc.status === "missing" ? "var(--color-red-500)" : "var(--color-neutral-400)" }} className="shrink-0" />
              <p className="text-[11px] font-semibold truncate" style={{ color: "var(--color-neutral-800)" }}>{doc.name}</p>
            </div>
            <p className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{doc.type}</p>
            <p className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{doc.source}</p>
            <p className="text-[10px]" style={{ color: "var(--color-neutral-500)" }}>{doc.date}</p>
            <StatusChip label={doc.status === "verified" ? "Verified" : doc.status === "missing" ? "Missing" : "Pending"} kind={statusKind(doc.status)} />
            <div className="flex justify-end">
              {doc.status !== "missing" && (
                <button className="text-[10px] font-semibold flex items-center gap-1 hover:underline" style={{ color: "var(--color-dark-blue-600)" }}>
                  <ExternalLink size={9} /> View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Reasoning ───────────────────────────────────────────────

function ReasoningTab({ meta }: { meta: EntityMeta }) {
  const signalStyle = (kind: "conflict" | "clear" | "warning") => ({
    conflict: { bg: "var(--color-red-000)",    border: "var(--color-red-200)",    color: "var(--color-red-700)" },
    clear:    { bg: "var(--color-green-000)",  border: "var(--color-green-200)",  color: "var(--color-green-700)" },
    warning:  { bg: "var(--color-yellow-000)", border: "var(--color-yellow-300)", color: "var(--color-yellow-800)" },
  }[kind]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-4 border" style={{ borderColor: "var(--color-dark-blue-100)", background: "var(--color-dark-blue-000)" }}>
        <Sparkles size={14} style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--color-dark-blue-600)" }}>Agent Reasoning — Entity Level</p>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-neutral-700)" }}>{meta.contextSummary}</p>
        </div>
      </div>

      {/* Confidence */}
      <ConfBar pct={meta.confidence} />

      {/* Key signals */}
      <div>
        <SectionLabel>Key Signals</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {meta.keySignals.map((s, i) => {
            const style = signalStyle(s.kind);
            return (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border" style={{ background: style.bg, borderColor: style.border, color: style.color }}>
                {s.kind === "conflict" && <AlertTriangle size={9} />}
                {s.kind === "clear"    && <CheckCircle2  size={9} />}
                {s.kind === "warning"  && <AlertCircle   size={9} />}
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Reasoning steps */}
      <div>
        <SectionLabel>Reasoning Steps</SectionLabel>
        <ol className="space-y-2.5">
          {meta.reasoningSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold border" style={{ borderColor: "var(--color-neutral-300)", color: "var(--color-neutral-500)", background: "var(--color-neutral-050)" }}>
                {i + 1}
              </span>
              <p className="text-[11px] leading-snug" style={{ color: "var(--color-neutral-700)" }}>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Evidence base */}
      <div>
        <SectionLabel>Evidence Base</SectionLabel>
        <div className="space-y-1.5">
          {meta.evidenceBase.map((ev, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 border" style={{ background: "var(--color-neutral-050)", borderColor: "var(--color-neutral-200)" }}>
              <FileText size={11} style={{ color: "var(--color-neutral-400)" }} className="shrink-0" />
              <p className="text-[11px]" style={{ color: "var(--color-neutral-700)" }}>{ev}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Audit ───────────────────────────────────────────────────

function AuditTab({ events }: { events: { time: string; title: string; detail: string; kind: string }[] }) {
  const iconOf = (kind: string) => {
    if (kind === "flag")   return <AlertTriangle size={12} style={{ color: "var(--color-yellow-600)" }} />;
    if (kind === "agent")  return <Sparkles      size={12} style={{ color: "var(--color-dark-blue-600)" }} />;
    if (kind === "submit") return <CheckCircle2  size={12} style={{ color: "var(--color-green-600)" }} />;
    return <Clock size={12} style={{ color: "var(--color-neutral-500)" }} />;
  };

  return (
    <div className="space-y-0 relative">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-4 bottom-4 w-px" style={{ background: "var(--color-neutral-200)" }} />
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-3 px-0 py-3 relative">
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border relative z-10" style={{ background: "white", borderColor: "var(--color-neutral-200)" }}>
            {iconOf(ev.kind)}
          </div>
          <div className="flex-1 min-w-0 pt-1.5">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-800)" }}>{ev.title}</p>
              <span className="text-[9px]" style={{ color: "var(--color-neutral-400)" }}>{ev.time}</span>
            </div>
            <p className="text-[10.5px] leading-snug" style={{ color: "var(--color-neutral-600)" }}>{ev.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

export function EntityDetailPanel({ entityName, caseNumber, onClose }: EntityDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const meta = ENTITY_DETAIL_META[entityName];
  if (!meta) return null;

  // Resolve attribute data
  const entityKey = meta.key;
  const attrs: AttrRow[] =
    entityKey === "institutional" ? (ENTITY_ATTRS["institutional"] ?? []) :
    entityKey === "advisors"      ? (ENTITY_ATTRS["advisors"] ?? []) :
    // Entity 13 — a small synthetic subset
    [
      { label: "Legal Name",        value: "Entity 13 Holdings LLC",   status: "verified", source: "CRM",         group: "Identity & Registration", lastUpdated: "2024-01-15" },
      { label: "Entity Type",       value: "Investment Entity",         status: "verified", source: "CRM",         group: "Identity & Registration", lastUpdated: "2024-01-15" },
      { label: "Jurisdiction",      value: "European Union",            status: "verified", source: "Third Party", group: "Identity & Registration", lastUpdated: "2024-01-15" },
      { label: "Risk Rating",       value: "Moderate",                  status: "verified", source: "Third Party", group: "Risk & Screening",         lastUpdated: "2024-11-01" },
      { label: "Sanctions",         value: "Cleared — 2024-11-01",      status: "verified", source: "Third Party", group: "Risk & Screening",         lastUpdated: "2024-11-01" },
      { label: "CIP Status",        value: "In Progress",               status: "conflict", source: "Forge",       group: "Compliance & KYC",         lastUpdated: "2025-04-14", notes: "Pending exception resolution" },
      { label: "Data Consistency",  value: "Flagged — registry extract",status: "conflict", source: "Third Party", group: "Compliance & KYC",         lastUpdated: "2025-04-14", notes: "Automated processing flagged Pg. 7 of entity registry extract" },
    ] as AttrRow[];

  const docs  = ENTITY_DOCS[entityName] ?? [];
  const audit = ENTITY_AUDIT[entityName] ?? [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview",    label: "Overview" },
    { id: "attributes",  label: `Attributes (${attrs.length})` },
    { id: "documents",   label: `Documents (${docs.length})` },
    { id: "reasoning",   label: "Reasoning" },
    { id: "audit",       label: `Audit (${audit.length})` },
  ];

  const riskColor =
    meta.riskLevel === "elevated" ? "var(--color-red-700)"    :
    meta.riskLevel === "moderate" ? "var(--color-yellow-700)" :
    "var(--color-green-700)";

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Entity detail: ${entityName}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,16,48,0.5)" }} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(900px, 92vw)",
          height: "88vh",
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          borderRadius: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* DS accent bar */}
        <div style={{ height: 3, background: "var(--color-dark-blue-600)", flexShrink: 0 }} />

        {/* Header */}
        <div className="shrink-0 flex items-start gap-4 px-6 py-4 border-b" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--color-dark-blue-600)" }}>
            <Building2 size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--color-neutral-900)" }}>{entityName}</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0 rounded border" style={{ background: "var(--color-dark-blue-000)", borderColor: "var(--color-dark-blue-200)", color: "var(--color-dark-blue-700)" }}>
                {caseNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold" style={{ color: riskColor }}>{meta.risk} Risk</span>
              <span style={{ color: "var(--color-neutral-300)" }}>·</span>
              <span className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{meta.kycStatus}</span>
              <span style={{ color: "var(--color-neutral-300)" }}>·</span>
              <span className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{meta.openExceptions} open exception{meta.openExceptions !== 1 ? "s" : ""}</span>
              <span style={{ color: "var(--color-neutral-300)" }}>·</span>
              <span className="text-[10px]" style={{ color: "var(--color-neutral-600)" }}>{meta.entityType}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-kyc-neutral-100 transition-colors shrink-0"
            aria-label="Close entity detail"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab nav */}
        <div className="shrink-0 flex border-b" style={{ borderColor: "var(--color-neutral-200)" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 text-[11px] font-semibold transition-colors whitespace-nowrap"
              style={activeTab === tab.id
                ? { color: "var(--color-dark-blue-600)", borderBottom: "2px solid var(--color-dark-blue-600)", background: "white" }
                : { color: "var(--color-neutral-500)", borderBottom: "2px solid transparent", background: "white" }}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {activeTab === "overview"   && <OverviewTab   entityName={entityName} meta={meta} attrs={attrs} />}
          {activeTab === "attributes" && <AttributesTab attrs={attrs} />}
          {activeTab === "documents"  && <DocumentsTab  docs={docs} />}
          {activeTab === "reasoning"  && <ReasoningTab  meta={meta} />}
          {activeTab === "audit"      && <AuditTab      events={audit} />}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-050)" }}>
          <p className="text-[10px]" style={{ color: "var(--color-neutral-400)" }}>
            {entityName} · {caseNumber} · Last reviewed {meta.lastKycReview}
          </p>
          <Button variant="text" size="small" label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
