/**
 * BeneficialOwnersView
 *
 * Kyros-inspired display of beneficial owner data: ownership bars, compliance
 * dots, mixed data types, and a multi-column attribute grid for the selected owner.
 * Tells a story — summary → owners at a glance → drill-in detail → action.
 */

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, FileText, ExternalLink, ChevronDown, X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type OwnerType    = "entity" | "individual" | "nominee";
export type ControlType  = "direct" | "indirect" | "nominee" | "unknown";
export type PepStatus    = "none" | "flagged" | "unknown";
export type SanctStatus  = "clear" | "flagged" | "unscreened";
export type OwnerStatus  = "verified" | "missing" | "pending";

export type DocStatus = "verified" | "pending" | "expired" | "missing";

export interface EvidenceDoc {
  name:       string;
  type:       string;
  status:     DocStatus;
  exceptions: string[];   // empty = no exceptions
}

export interface EnhancedOwnerRow {
  id:              string;
  owner:           string;
  ownershipPct:    number | null;   // null = undisclosed
  type:            OwnerType;
  controlType:     ControlType;
  nationality:     string;
  jurisdiction?:   string;
  pep:             PepStatus;
  sanctions:       SanctStatus;
  confidence:      number;          // 0–100
  status:          OwnerStatus;
  evidenceSources: string[];
  documents:       EvidenceDoc[];
  lastVerified?:   string;
  comment:         string;
  missing?:        boolean;
  attributes: {
    registrationNo?:    string;
    jurisdiction?:      string;
    votingRights?:      string;
    controlMechanism?:  string;
    declarationStatus:  string;
    idDocument?:        string;
    nationality?:       string;
    dob?:               string;
  };
}

/* ------------------------------------------------------------------ */
/*  Data — exported so the dashboard can reference owner ids            */
/* ------------------------------------------------------------------ */

export const ENHANCED_OWNERS: EnhancedOwnerRow[] = [
  {
    id: "o1",
    owner: "Vanguard Group",
    ownershipPct: 35,
    type: "entity",
    controlType: "direct",
    nationality: "US",
    jurisdiction: "Wilmington, Delaware",
    pep: "none",
    sanctions: "clear",
    confidence: 60,
    status: "verified",
    evidenceSources: ["SEC Form 13G", "Registry Extract"],
    lastVerified: "Jan 10, 2026",
    comment: "registry extract",
    documents: [
      { name: "SEC Form 13G (2025)",        type: "Regulatory Filing",    status: "verified", exceptions: [] },
      { name: "Delaware Registry Extract",   type: "Corporate Registry",   status: "verified", exceptions: [] },
      { name: "UBO Declaration",             type: "Declaration",          status: "verified", exceptions: [] },
    ],
    attributes: {
      registrationNo:   "SEC-VG-291839",
      jurisdiction:     "Wilmington, Delaware, USA",
      votingRights:     "35%",
      controlMechanism: "Direct shareholding",
      declarationStatus:"Signed & filed — Q4 2025",
    },
  },
  {
    id: "o2",
    owner: "State Street Corp",
    ownershipPct: 30,
    type: "entity",
    controlType: "direct",
    nationality: "US",
    jurisdiction: "Boston, Massachusetts",
    pep: "none",
    sanctions: "clear",
    confidence: 50,
    status: "verified",
    evidenceSources: ["SEC Form 13G"],
    lastVerified: "Dec 03, 2025",
    comment: "13G filing",
    documents: [
      { name: "SEC Form 13G (2025)",   type: "Regulatory Filing",  status: "verified", exceptions: [] },
      { name: "UBO Declaration",        type: "Declaration",        status: "pending",  exceptions: ["Declaration not countersigned by authorised officer"] },
      { name: "Passport — R. O'Hanlon",type: "ID Document",        status: "expired",  exceptions: ["Passport expired Jan 2025 — renewal required before approval"] },
    ],
    attributes: {
      registrationNo:   "SEC-SS-184729",
      jurisdiction:     "Boston, Massachusetts, USA",
      votingRights:     "30%",
      controlMechanism: "Direct shareholding",
      declarationStatus:"Filed — Nov 2025",
    },
  },
  {
    id: "o3",
    owner: "Undisclosed minority owner",
    ownershipPct: null,
    type: "individual",
    controlType: "unknown",
    nationality: "—",
    pep: "unknown",
    sanctions: "unscreened",
    confidence: 0,
    status: "missing",
    evidenceSources: [],
    comment: "awaiting client response",
    missing: true,
    documents: [
      { name: "UBO Declaration",  type: "Declaration", status: "missing", exceptions: ["No UBO declaration on file — client response overdue (>30 days)"] },
      { name: "Government-issued ID", type: "ID Document", status: "missing", exceptions: ["Identity not verified — no ID document received"] },
    ],
    attributes: {
      declarationStatus:"Missing — UBO declaration not provided",
      nationality:      "Unknown",
      dob:              "—",
      idDocument:       "—",
      votingRights:     "Unknown",
      controlMechanism: "Unknown",
    },
  },
  {
    id: "o4",
    owner: "BlackRock Inc. (parent)",
    ownershipPct: 23,
    type: "entity",
    controlType: "indirect",
    nationality: "US",
    jurisdiction: "New York, USA",
    pep: "none",
    sanctions: "clear",
    confidence: 23,
    status: "verified",
    evidenceSources: ["Operating Agreement"],
    lastVerified: "Nov 15, 2025",
    comment: "operating agreement",
    documents: [
      { name: "Operating Agreement (2024)", type: "Legal Agreement",   status: "verified", exceptions: [] },
      { name: "Parent Entity Registry",     type: "Corporate Registry",status: "verified", exceptions: [] },
      { name: "UBO Declaration (parent)",   type: "Declaration",       status: "pending",  exceptions: ["Filed via parent — individual beneficial owners not independently verified"] },
    ],
    attributes: {
      registrationNo:   "NYSE: BLK",
      jurisdiction:     "New York, USA",
      votingRights:     "23%",
      controlMechanism: "Indirect — parent entity",
      declarationStatus:"Filed via parent — 2024",
    },
  },
  {
    id: "o5",
    owner: "BlackRock Group",
    ownershipPct: 3,
    type: "entity",
    controlType: "direct",
    nationality: "US",
    jurisdiction: "New York, USA",
    pep: "none",
    sanctions: "clear",
    confidence: 3,
    status: "verified",
    evidenceSources: ["Org Chart"],
    lastVerified: "Feb 28, 2026",
    comment: "Org chart",
    documents: [
      { name: "Org Chart (Feb 2026)",  type: "Internal Document",  status: "verified", exceptions: [] },
      { name: "UBO Declaration",        type: "Declaration",        status: "verified", exceptions: [] },
    ],
    attributes: {
      registrationNo:   "BRK-GRP-0021",
      jurisdiction:     "New York, USA",
      votingRights:     "3%",
      controlMechanism: "Direct shareholding",
      declarationStatus:"Filed",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Atom: ownership-type chip                                           */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<OwnerType, { label: string; bg: string; color: string }> = {
  entity:     { label: "Entity",     bg: "var(--color-neutral-100)",   color: "var(--color-neutral-700)"   },
  individual: { label: "Individual", bg: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)" },
  nominee:    { label: "Nominee",    bg: "var(--color-yellow-000)",    color: "var(--color-neutral-800)"   },
};

function TypeChip({ type }: { type: OwnerType }) {
  const { label, bg, color } = TYPE_CONFIG[type];
  return (
    <span
      className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Atom: status badge                                                  */
/* ------------------------------------------------------------------ */
/*  Document viewer modal                                               */
/* ------------------------------------------------------------------ */

const DOC_STATUS_CFG: Record<DocStatus, { label: string; bg: string; color: string; border: string }> = {
  verified: { label: "Verified", bg: "var(--color-green-000)",  color: "var(--color-green-700)",   border: "var(--color-green-200)"  },
  pending:  { label: "Pending",  bg: "var(--color-yellow-000)", color: "var(--color-neutral-900)", border: "var(--color-yellow-300)" },
  expired:  { label: "Expired",  bg: "var(--color-red-000)",    color: "var(--color-red-700)",     border: "var(--color-red-200)"   },
  missing:  { label: "Missing",  bg: "var(--color-red-000)",    color: "var(--color-red-700)",     border: "var(--color-red-200)"   },
};

// Simulated document body content per doc type
function docBody(doc: EvidenceDoc): string {
  if (doc.status === "missing") return "[No document on file — awaiting client submission]";
  if (doc.type === "Regulatory Filing") return `UNITED STATES SECURITIES AND EXCHANGE COMMISSION\nWashington, D.C. 20549\n\nSCHEDULE 13G\nUnder the Securities Exchange Act of 1934\n\nFiling Entity: ${doc.name.replace("SEC Form 13G", "").trim() || "Vanguard Group, Inc."}\nCUSIP Number: 09248X100\nDate of Event: December 31, 2024\n\nItem 1: Reporting Person\nVanguard Group, Inc.\n\nItem 5: Ownership\nAggregate amount beneficially owned: 35,291,412\nPercent of class: 35.0%\nSole power to vote: 0\nShared power to vote: 35,291,412\n\nItem 10: Certifications\nBy signing below I certify that, to the best of my knowledge and belief, the securities referred to above were acquired in the ordinary course of business...`;
  if (doc.type === "Declaration") return `UBO DECLARATION\n\nEntity: BlackRock Advisors LLC\nDate: November 14, 2025\nReference: UBO-2025-0847\n\nI, the undersigned authorised officer, hereby declare that the following individuals are the ultimate beneficial owners of the above-named entity:\n\n1. Lawrence D. Fink — Indirect control via BlackRock Inc. parent\n2. Robert S. Kapito — Indirect control via BlackRock Inc. parent\n\nAll persons listed above hold, directly or indirectly, more than 25% of the shares or voting rights, or otherwise exercise control.\n\nSigned: ____________________\nPosition: Chief Compliance Officer\nDate: November 14, 2025\n\n${doc.status === "pending" ? "⚠ PENDING: Countersignature from authorised officer required." : "✓ Countersigned and filed."}`;
  if (doc.type === "ID Document") return `PASSPORT\n\nSurname: O'HANLON\nGiven Names: RICHARD JAMES\nNationality: IRISH\nDate of Birth: 14 MAR 1968\nSex: M\nPlace of Birth: DUBLIN, IRELAND\nDate of Issue: 15 JAN 2015\nDate of Expiry: 14 JAN 2025\n\nPassport No: PA1847362\n\n${doc.status === "expired" ? "⚠ EXPIRED: This document expired January 2025. A renewed passport is required prior to case approval." : ""}`;
  if (doc.type === "Corporate Registry") return `DELAWARE DIVISION OF CORPORATIONS\nCertificate of Good Standing\n\nEntity Name: VANGUARD GROUP INC.\nFile Number: 2918390\nIncorporation Date: September 24, 1975\nRegistered Agent: The Corporation Trust Company\n1209 Orange Street, Wilmington, DE 19801\n\nStatus: GOOD STANDING\nLast Annual Report Filed: March 2025\n\nThis certificate is issued under the seal of the Division of Corporations as evidence of the above entity's existence and good standing.`;
  return `[Document: ${doc.name}]\n\nType: ${doc.type}\nStatus: ${doc.status}\n\nDocument content is available upon request from the Evidence Locker.`;
}

function DocViewerModal({ doc, ownerName, onClose }: { doc: EvidenceDoc; ownerName: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const cfg = DOC_STATUS_CFG[doc.status];
  const body = docBody(doc);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--color-dark-blue-900, #00143c)", opacity: 0.5 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative flex flex-col w-full max-w-2xl mx-4 overflow-hidden"
        style={{
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--corner-200)",
          boxShadow: "var(--shadow-400)",
          maxHeight: "85vh",
        }}
      >
        {/* Accent stripe */}
        <div style={{ height: 3, background: "var(--color-dark-blue-600)", flexShrink: 0 }} />

        {/* Header */}
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{ flexShrink: 0, borderBottom: "1px solid var(--color-neutral-200)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)" }}
          >
            <FileText size={16} style={{ color: "var(--color-dark-blue-600)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--color-neutral-900)" }}>{doc.name}</h2>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
              >{cfg.label}</span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-neutral-500)" }}>{doc.type} · Owner: {ownerName}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[
              { icon: <ZoomOut size={13} aria-hidden="true" />, label: "Zoom out",  onClick: () => setZoom(z => Math.max(0.7, z - 0.1)) },
              { icon: <ZoomIn  size={13} aria-hidden="true" />, label: "Zoom in",   onClick: () => setZoom(z => Math.min(1.5, z + 0.1)) },
              { icon: <Download size={13} aria-hidden="true" />, label: "Download", onClick: undefined },
              { icon: <X size={14} aria-hidden="true" />,        label: "Close",    onClick: onClose },
            ].map(({ icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                aria-label={label}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors"
                style={{ color: "var(--color-neutral-500)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-neutral-100)"; e.currentTarget.style.color = "var(--color-neutral-800)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--color-neutral-500)"; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Exceptions banner */}
        {doc.exceptions.length > 0 && (
          <div className="px-5 py-2.5 flex flex-col gap-1" style={{ flexShrink: 0, background: "var(--color-red-000)", borderBottom: "1px solid var(--color-red-200)" }}>
            {doc.exceptions.map((ex, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: "var(--color-red-700)" }}>
                <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                <span>{ex}</span>
              </div>
            ))}
          </div>
        )}

        {/* Document body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ background: "var(--color-neutral-000)" }}>
          <div
            className="rounded-lg px-8 py-8 mx-auto"
            style={{
              background: "var(--color-base-white)",
              border: "1px solid var(--color-neutral-200)",
              boxShadow: "var(--shadow-100)",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: `${13 * zoom}px`,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: "var(--color-neutral-900)",
              maxWidth: 560,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              minHeight: 320,
            }}
          >
            {body}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ flexShrink: 0, borderTop: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>Evidence Locker · Read-only view</span>
          <Button variant="outlined" size="small" label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function EvidenceDocList({ documents, ownerName }: { documents: EvidenceDoc[]; ownerName: string }) {
  const [activeDoc, setActiveDoc] = useState<EvidenceDoc | null>(null);

  return (
    <div className="px-3 py-2.5">
      {activeDoc && (
        <DocViewerModal doc={activeDoc} ownerName={ownerName} onClose={() => setActiveDoc(null)} />
      )}
      <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-neutral-500)" }}>Evidence</p>
      <div className="space-y-2">
        {documents.map((doc, i) => {
          const cfg = DOC_STATUS_CFG[doc.status];
          const canOpen = doc.status !== "missing";
          return (
            <div
              key={i}
              onClick={() => canOpen && setActiveDoc(doc)}
              className={`rounded overflow-hidden transition-all ${canOpen ? "cursor-pointer" : "opacity-60"}`}
              style={{
                border: doc.exceptions.length > 0 ? "1px solid var(--color-red-200)" : "1px solid var(--color-neutral-200)",
                background: doc.exceptions.length > 0 ? "var(--color-red-000)" : "var(--color-base-white)",
              }}
              onMouseEnter={e => { if (canOpen) e.currentTarget.style.borderColor = "var(--color-dark-blue-400)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = doc.exceptions.length > 0 ? "var(--color-red-200)" : "var(--color-neutral-200)"; }}
            >
              <div className="flex items-center gap-2 px-2.5 py-1.5">
                <FileText size={9} className="shrink-0" style={{ color: "var(--color-neutral-400)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate" style={{ color: "var(--color-neutral-800)" }}>{doc.name}</p>
                  <p className="text-[9px]" style={{ color: "var(--color-neutral-500)" }}>{doc.type}</p>
                </div>
                {canOpen && <ExternalLink size={8} className="shrink-0 mr-1" style={{ color: "var(--color-neutral-300)" }} />}
                <span
                  className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                  style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                >
                  {cfg.label}
                </span>
              </div>
              {doc.exceptions.length > 0 && (
                <div className="px-2.5 pb-1.5 pt-0 space-y-1">
                  {doc.exceptions.map((ex, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-[9px]" style={{ color: "var(--color-red-700)" }}>
                      <AlertTriangle size={8} className="shrink-0 mt-0.5" />
                      <span className="leading-tight">{ex}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: OwnerStatus }) {
  const cfg = {
    verified: { icon: <CheckCircle size={8} />,   label: "Verified", bg: "var(--color-green-000)",  color: "var(--color-green-700)",   border: "var(--color-green-200)"  },
    missing:  { icon: <AlertTriangle size={8} />, label: "Missing",  bg: "var(--color-red-000)",    color: "var(--color-red-700)",     border: "var(--color-red-200)"   },
    pending:  { icon: <Clock size={8} />,         label: "Pending",  bg: "var(--color-yellow-000)", color: "var(--color-neutral-900)", border: "var(--color-yellow-300)" },
  }[status];
  return (
    <span
      className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.icon}{cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Atom: compliance indicator                                          */
/* ------------------------------------------------------------------ */

function ComplianceRow({ pep, sanctions }: { pep: PepStatus; sanctions: SanctStatus }) {
  const pepOk      = pep === "none";
  const sanctOk    = sanctions === "clear";
  const pepUnknown = pep === "unknown";
  const sUnknown   = sanctions === "unscreened";

  return (
    <div className="flex items-center gap-2">
      <span
        title={`PEP: ${pep}`}
        className={`flex items-center gap-0.5 text-[8px] font-semibold ${
          pepUnknown ? "text-gray-400" : pepOk ? "text-green-600" : "text-ds-red-700"
        }`}
      >
      </span>
      <span
        title={`Sanctions: ${sanctions}`}
        className={`flex items-center gap-0.5 text-[8px] font-semibold ${
          sUnknown ? "text-gray-400" : sanctOk ? "text-green-600" : "text-ds-red-700"
        }`}
      >
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Atom: ownership bar                                                 */
/* ------------------------------------------------------------------ */

function OwnershipBar({ pct, confidence }: { pct: number | null; confidence: number }) {
  const barColor =
    pct === null     ? "var(--color-neutral-300)" :
    confidence >= 60 ? "var(--color-green-500)"   :
    confidence >= 40 ? "var(--color-yellow-500)"  : "var(--color-red-700)";
  const textColor =
    pct === null     ? "var(--color-neutral-400)" :
    confidence >= 60 ? "var(--color-green-700)"   :
    confidence >= 40 ? "var(--color-neutral-800)" : "var(--color-red-700)";
  const pctWidth = pct !== null ? `${Math.min(pct * 2.5, 100)}%` : "12%";

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "var(--color-neutral-200)" }}>
        <div className="h-full rounded-full" style={{ width: pctWidth, background: barColor }} />
      </div>
      <span className="text-[11px] font-bold w-8 shrink-0" style={{ color: textColor }}>
        {pct !== null ? `${pct}%` : "—"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Owner row item                                                      */
/* ------------------------------------------------------------------ */

function OwnerRowItem({
  row, selected, expanded, onSelect, onToggleExpand,
}: {
  row: EnhancedOwnerRow;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-neutral-100)",
        borderLeft: selected ? "3px solid var(--color-dark-blue-600)" : "3px solid transparent",
        background: selected ? "var(--color-dark-blue-000)" : row.missing ? "var(--color-red-000)" : "var(--color-base-white)",
      }}
    >
      {/* Main row */}
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
        className="w-full text-left px-4 py-3 transition-colors cursor-pointer"
        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--color-neutral-000)"; }}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = ""; }}
      >
        <div className="flex items-center gap-3">

          {/* Zone 1: Identity */}
          <div className="min-w-0" style={{ width: 176 }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <TypeChip type={row.type} />
              <span className="text-[9px] capitalize" style={{ color: "var(--color-neutral-400)" }}>{row.controlType} control</span>
            </div>
            <p
              className="text-[11.5px] font-semibold leading-tight truncate"
              style={{ color: selected ? "var(--color-dark-blue-600)" : row.missing ? "var(--color-red-700)" : "var(--color-neutral-800)" }}
            >
              {row.owner}
            </p>
            {row.jurisdiction && (
              <p className="text-[9px] truncate mt-0.5" style={{ color: "var(--color-neutral-400)" }}>{row.jurisdiction}</p>
            )}
          </div>

          {/* Zone 2: Ownership % */}
          <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
            <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: "var(--color-neutral-400)" }}>Ownership</p>
            <p
              className="text-[13px] font-bold leading-none"
              style={{ color: row.ownershipPct === null ? "var(--color-neutral-400)" : "var(--color-neutral-700)" }}
            >
              {row.ownershipPct !== null ? `${row.ownershipPct}%` : "—"}
            </p>
          </div>

          {/* Zone 3: Compliance */}
          <div className="shrink-0">
            <ComplianceRow pep={row.pep} sanctions={row.sanctions} />
          </div>

          {/* Zone 4: Confidence + Status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right" style={{ width: 44 }}>
              <p
                className="text-[13px] font-bold leading-none"
                style={{ color: row.confidence === 0 ? "var(--color-neutral-400)" : row.confidence >= 60 ? "var(--color-green-700)" : row.confidence >= 40 ? "var(--color-neutral-800)" : "var(--color-red-700)" }}
              >
                {row.confidence > 0 ? `${row.confidence}%` : "—"}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          {/* Zone 5: Expand toggle */}
          <button
            onClick={onToggleExpand}
            aria-label={expanded ? "Collapse details" : "Expand details"}
            aria-expanded={expanded}
            className="shrink-0 p-1 rounded transition-colors"
            style={{ color: expanded ? "var(--color-dark-blue-600)" : "var(--color-neutral-500)", background: expanded ? "var(--color-dark-blue-000)" : "transparent" }}
            onMouseEnter={e => { if (!expanded) { e.currentTarget.style.color = "var(--color-neutral-800)"; e.currentTarget.style.background = "var(--color-neutral-100)"; } }}
            onMouseLeave={e => { if (!expanded) { e.currentTarget.style.color = "var(--color-neutral-500)"; e.currentTarget.style.background = "transparent"; } }}
          >
            <ChevronDown size={13} aria-hidden="true" className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Evidence chips */}
        {row.evidenceSources.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {row.evidenceSources.map((src, i) => (
              <span
                key={i}
                className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded"
                style={{ color: "var(--color-neutral-600)", background: "var(--color-neutral-100)" }}
              >
                <FileText size={7} />{src}
              </span>
            ))}
            {row.lastVerified && (
              <span className="text-[9px] ml-1" style={{ color: "var(--color-neutral-400)" }}>· Last verified {row.lastVerified}</span>
            )}
          </div>
        )}
        {row.missing && (
          <div className="flex items-center gap-1 mt-1.5 text-[9px] font-medium" style={{ color: "var(--color-red-700)" }}>
            <AlertTriangle size={9} />{row.comment}
          </div>
        )}
      </div>

      {/* Inline drill-down detail */}
      {expanded && (
        <div className="mx-4 mb-3 mt-0.5">
          <OwnerAttributeGrid row={row} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary strip                                                       */
/* ------------------------------------------------------------------ */

function SummaryStrip({ rows }: { rows: EnhancedOwnerRow[] }) {
  const totalPct     = rows.reduce((s, r) => s + (r.ownershipPct ?? 0), 0);
  const missingCount = rows.filter(r => r.status === "missing").length;
  const avgConf      = Math.round(rows.reduce((s, r) => s + r.confidence, 0) / rows.length);
  const verifiedN    = rows.filter(r => r.status === "verified").length;

  const confColor = avgConf >= 60 ? "var(--color-green-700)" : avgConf >= 40 ? "var(--color-neutral-800)" : "var(--color-red-700)";

  return (
    <div
      className="flex items-stretch gap-0 px-4 py-2.5 text-[10px]"
      style={{
        background: "var(--color-neutral-000)",
        borderBottom: "1px solid var(--color-neutral-200)",
        divideColor: "var(--color-neutral-200)",
      }}
    >

      {/* Ownership fill bar */}
      <div className="flex items-center gap-2.5 pr-4" style={{ borderRight: "1px solid var(--color-neutral-200)" }}>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-neutral-500)" }}>Ownership Identified</p>
          <div className="flex items-center gap-1.5">
            <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-200)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(totalPct, 100)}%`, background: "var(--color-dark-blue-600)" }} />
            </div>
            <span className="font-bold text-[12px]" style={{ color: "var(--color-dark-blue-600)" }}>{totalPct}%</span>
          </div>
        </div>
      </div>

      {/* Owners verified */}
      <div className="flex flex-col justify-center px-4" style={{ borderRight: "1px solid var(--color-neutral-200)" }}>
        <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-neutral-500)" }}>Verified</p>
        <p className="font-bold text-[13px] leading-none" style={{ color: "var(--color-green-700)" }}>
          {verifiedN}<span className="text-[10px] font-normal ml-0.5" style={{ color: "var(--color-neutral-500)" }}>/ {rows.length}</span>
        </p>
      </div>

      {/* Avg confidence */}
      <div className="flex flex-col justify-center px-4" style={{ borderRight: missingCount > 0 ? "1px solid var(--color-neutral-200)" : undefined }}>
        <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-neutral-500)" }}>Avg. Confidence</p>
        <p className="font-bold text-[13px] leading-none" style={{ color: confColor }}>{avgConf}%</p>
      </div>

      {/* Issues */}
      {missingCount > 0 && (
        <div className="flex items-center gap-1.5 px-4" style={{ color: "var(--color-red-700)" }}>
          <AlertTriangle size={15} />
          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-red-700)" }}>Action Required</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Owner attribute grid — used in right panel                          */
/* ------------------------------------------------------------------ */

function AttrPair({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-neutral-500)" }}>{label}</p>
      <p className="text-[10.5px] font-medium leading-snug" style={{ color: highlight ? "var(--color-red-700)" : "var(--color-neutral-800)" }}>
        {value}
      </p>
    </div>
  );
}

export function OwnerAttributeGrid({ row }: { row: EnhancedOwnerRow }) {
  const isIndividual = row.type === "individual";

  return (
    <div className="rounded-lg overflow-hidden text-[10.5px]" style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-000)" }}>

      {/* Identity — only fields not shown in the row */}
      <div className="px-3 pt-3 pb-2.5" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-neutral-500)" }}>Identity</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <AttrPair label="Nationality" value={row.attributes.nationality ?? row.nationality} highlight={row.attributes.nationality === "Unknown"} />
          {isIndividual
            ? <AttrPair label="Date of Birth" value={row.attributes.dob ?? "—"} highlight={!row.attributes.dob} />
            : row.attributes.registrationNo
              ? <AttrPair label="Registration No." value={row.attributes.registrationNo} />
              : null
          }
          {isIndividual && (
            <AttrPair label="ID Document" value={row.attributes.idDocument ?? "—"} highlight={!row.attributes.idDocument} />
          )}
        </div>
      </div>

      {/* Ownership — only non-obvious fields */}
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-neutral-500)" }}>Ownership Structure</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <AttrPair label="Voting Rights"     value={row.attributes.votingRights     ?? "—"} highlight={!row.attributes.votingRights} />
          <AttrPair label="Control Mechanism" value={row.attributes.controlMechanism ?? "—"} highlight={!row.attributes.controlMechanism} />
        </div>
      </div>

      {/* Declaration */}
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-neutral-500)" }}>Declaration</p>
        <AttrPair
          label="UBO Declaration"
          value={row.attributes.declarationStatus}
          highlight={row.missing}
        />
        {row.lastVerified && (
          <div className="mt-2">
            <AttrPair label="Last Verified" value={row.lastVerified} />
          </div>
        )}
      </div>

      {/* Evidence Documents */}
      <EvidenceDocList documents={row.documents} ownerName={row.owner} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                         */
/* ------------------------------------------------------------------ */

export function BeneficialOwnersView({
  rows, selectedId, onSelect,
}: {
  rows:       EnhancedOwnerRow[];
  selectedId: string | null;
  onSelect:   (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div>
      <SummaryStrip rows={rows} />
      {rows.map(row => (
        <OwnerRowItem
          key={row.id}
          row={row}
          selected={row.id === selectedId}
          expanded={row.id === expandedId}
          onSelect={() => onSelect(row.id === selectedId ? "" : row.id)}
          onToggleExpand={(e) => toggleExpand(row.id, e)}
        />
      ))}
    </div>
  );
}
