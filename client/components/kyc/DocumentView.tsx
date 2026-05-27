import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle, CheckCircle, Clock, Plus,
  FileText, Upload, Edit2, ArrowLeft, ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type AnnotationType =
  | "entity-mismatch"
  | "expired-id"
  | "name-discrepancy"
  | "address-mismatch"
  | "custom";

type RiskFlag   = "high" | "medium" | "low";
type AnnStatus  = "open" | "escalated" | "resolved";
type AnchorId   =
  | "entity-name"
  | "resolution-date"
  | "sig-fink"
  | "sig-small"
  | "execution-clause"
  | "company-seal"
  | "text-selection";

interface Annotation {
  id:        string;
  anchorId:  AnchorId;
  number:    number;
  type:      AnnotationType;
  riskFlag:  RiskFlag;
  status:    AnnStatus;
  field:     string;
  comment:   string;
  reviewer:  string;
  createdAt: string;
  /** Stored position relative to the scroll container, for text-selection annotations */
  selectionRect?: { top: number; left: number; width: number; height: number };
}

/* ------------------------------------------------------------------ */
/*  Lookup tables  (full Tailwind strings so JIT can detect them)      */
/* ------------------------------------------------------------------ */

const ISSUE_OPTS: { v: AnnotationType; l: string }[] = [
  { v: "entity-mismatch",   l: "Entity Name Mismatch"  },
  { v: "expired-id",        l: "Expired ID / Document" },
  { v: "name-discrepancy",  l: "Name Discrepancy"      },
  { v: "address-mismatch",  l: "Address Mismatch"      },
  { v: "custom",            l: "Custom Issue"           },
];
const ISSUE_LBL = Object.fromEntries(
  ISSUE_OPTS.map(o => [o.v, o.l])
) as Record<AnnotationType, string>;

const ANCHOR_LBL: Record<AnchorId, string> = {
  "entity-name":      "Legal Entity Name",
  "resolution-date":  "Resolution Date",
  "sig-fink":         "Signatory – L. Fink",
  "sig-small":        "Signatory – M. Small",
  "execution-clause": "Execution Clause",
  "company-seal":     "Company Seal / Secretary",
  "text-selection":   "Selected Text",
};

const R_FLAG_LABEL: Record<RiskFlag, string> = {
  high:   "High",
  medium: "Med",
  low:    "Low",
};
const R_BADGE: Record<RiskFlag, string> = {
  high:   "bg-red-600 text-white",
  medium: "bg-ds-yellow-800 text-gray-900",
  low:    "bg-blue-500 text-white",
};
const R_ACTIVE_CLS: Record<RiskFlag, string> = {
  high:   "bg-red-50 border-2 border-red-600",
  medium: "bg-ds-yellow-000 border-2 border-ds-yellow-800",
  low:    "bg-blue-50 border-2 border-blue-500",
};
const R_INACTIVE_CLS: Record<RiskFlag, string> = {
  high:   "border-2 border-red-600 hover:bg-red-50",
  medium: "border-2 border-ds-yellow-800 hover:bg-ds-yellow-000",
  low:    "border-2 border-blue-500 hover:bg-blue-50",
};
const R_TR_ACTIVE: Record<RiskFlag, string> = {
  high:   "bg-red-50",
  medium: "bg-amber-50",
  low:    "bg-blue-50",
};
const R_TR_HOVER: Record<RiskFlag, string> = {
  high:   "hover:bg-red-50",
  medium: "hover:bg-amber-50",
  low:    "hover:bg-blue-50",
};

const S_CFG: Record<AnnStatus, { l: string; cls: string; icon: React.ReactNode }> = {
  open:      { l: "Open",      cls: "text-amber-700 bg-amber-50 border-amber-200",  icon: <Clock size={9} />          },
  escalated: { l: "Escalated", cls: "text-red-700 bg-red-50 border-red-200",        icon: <AlertTriangle size={9} />  },
  resolved:  { l: "Addressed", cls: "text-green-700 bg-green-50 border-green-200",  icon: <CheckCircle size={9} />    },
};

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const INIT_ANNS: Annotation[] = [
  {
    id: "ann-1", number: 1, anchorId: "entity-name",
    type: "entity-mismatch", riskFlag: "high", status: "open",
    field: "Legal Entity Name",
    comment:
      "Document references 'BlackRock Group Holdings Ltd.' but the KYC subject is 'BlackRock Advisors LLC'. " +
      "Names do not match registered records. An updated board resolution or formal legal name confirmation " +
      "is required before approval can proceed.",
    reviewer: "Alex Kim", createdAt: "Apr 14, 2026",
  },
  {
    id: "ann-2", number: 2, anchorId: "sig-fink",
    type: "expired-id", riskFlag: "high", status: "open",
    field: "Passport – L. Fink (US482901773)",
    comment:
      "Passport No. US482901773 for Lawrence D. Fink expired March 2024. " +
      "KYC Policy §4.2 requires valid unexpired government-issued identification for all named signatories. " +
      "A current copy must be obtained and re-submitted prior to case closure.",
    reviewer: "Alex Kim", createdAt: "Apr 14, 2026",
  },
  {
    id: "ann-3", number: 3, anchorId: "sig-small",
    type: "name-discrepancy", riskFlag: "medium", status: "escalated",
    field: "Signatory – Martin S. Small",
    comment:
      "Martin S. Small is listed as an authorised signatory but does not appear in the current " +
      "Certificate of Incumbency or entity ownership records. Escalated for verification against " +
      "the corporate registry. Updated officer declaration required.",
    reviewer: "Sarah Chen", createdAt: "Apr 15, 2026",
  },
];

type RelDocStatus = "Verified" | "Pending" | "Expired";

const REL_DOCS: { type: string; entity: string; updated: string; status: RelDocStatus }[] = [
  { type: "Certificate of Incumbency",        entity: "BlackRock Advisors LLC",    updated: "Jan 10, 2026", status: "Verified" },
  { type: "M&A of Association",               entity: "BlackRock Group Holdings",  updated: "Dec 03, 2023", status: "Pending"  },
  { type: "Passport Copy – L. Fink",          entity: "BlackRock Advisors LLC",    updated: "Mar 01, 2024", status: "Expired"  },
  { type: "UBO Declaration",                  entity: "Vanguard Group",            updated: "Nov 15, 2025", status: "Verified" },
];


/* ------------------------------------------------------------------ */
/*  Tiny shared helpers                                                 */
/* ------------------------------------------------------------------ */

function MetaCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[8px] font-semibold uppercase tracking-widest text-kyc-neutral-600 mb-0.5">{label}</p>
      <div className="text-[10px] font-semibold text-kyc-neutral-800 truncate">{children}</div>
    </div>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[8px] font-semibold uppercase tracking-wider text-kyc-neutral-600">{children}</p>;
}
function FieldVal({ children }: { children: React.ReactNode }) {
  return <p className="text-[9.5px] text-kyc-neutral-800 mt-0.5">{children}</p>;
}

/* ------------------------------------------------------------------ */
/*  Badge                                                               */
/* ------------------------------------------------------------------ */

function Badge({
  ann, activeId, onSelect,
}: {
  ann: Annotation; activeId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(ann.id); }}
      className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center justify-center shrink-0
        shadow hover:scale-105 transition-transform whitespace-nowrap
        ${R_BADGE[ann.riskFlag]}
        ${ann.id === activeId ? "ring-2 ring-white ring-offset-1 shadow-md" : ""}`}
      title={`Annotation ${ann.number}: ${ISSUE_LBL[ann.type]}`}
    >
      {R_FLAG_LABEL[ann.riskFlag]}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  AnnField – wraps a non-table document element                       */
/* ------------------------------------------------------------------ */

function AnnField({
  anchorId, anns, activeId, addMode, onSelect, onAddClick,
  children, className = "",
}: {
  anchorId:   AnchorId;
  anns:       Annotation[];
  activeId:   string | null;
  addMode:    boolean;
  onSelect:   (id: string) => void;
  onAddClick: (a: AnchorId) => void;
  children:   React.ReactNode;
  className?: string;
}) {
  const ann    = anns.find(a => a.anchorId === anchorId);
  const active = ann?.id === activeId;

  return (
    <div
      className={`relative p-1.5 rounded transition-colors duration-100
        ${addMode ? "cursor-crosshair" : ann ? "cursor-pointer" : ""}
        ${active && ann ? R_ACTIVE_CLS[ann.riskFlag] : ann ? R_INACTIVE_CLS[ann.riskFlag] : ""}
        ${className}`}
      onClick={() => { if (addMode) { onAddClick(anchorId); return; } if (ann) onSelect(ann.id); }}
    >
      {ann && (
        <span className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none">
          <Badge ann={ann} activeId={activeId} onSelect={id => { onSelect(id); }} />
        </span>
      )}
      {addMode && !ann && (
        <span className="absolute inset-0 border border-dashed border-kyc-blue/30 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Board Resolution document                                           */
/* ------------------------------------------------------------------ */

function BoardResolutionDoc({
  anns, activeId, addMode, onSelect, onAddClick, containerRef,
}: {
  anns:          Annotation[];
  activeId:      string | null;
  addMode:       boolean;
  onSelect:      (id: string) => void;
  onAddClick:    (a: AnchorId) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const getAnn = (a: AnchorId) => anns.find(x => x.anchorId === a);

  const trCls = (a: AnchorId) => {
    const ann    = getAnn(a);
    const active = ann?.id === activeId;
    if (!ann) return "hover:bg-gray-50 transition-colors";
    const borderCls = ann.riskFlag === "high" ? "outline outline-2 outline-red-600" :
                      ann.riskFlag === "medium" ? "outline outline-2 outline-ds-yellow-800" :
                      "outline outline-2 outline-blue-500";
    return `transition-colors cursor-pointer relative ${borderCls}
      ${active ? R_TR_ACTIVE[ann.riskFlag] : R_TR_HOVER[ann.riskFlag]}`;
  };

  return (
    <div ref={containerRef} className={`flex-1 min-h-0 overflow-y-auto bg-white text-[10px] leading-[1.55] text-gray-800 relative ${addMode ? "cursor-crosshair" : ""}`}>
      <div className="px-4 pt-3 pb-5">

        {/* Letterhead */}
        <div className="text-center mb-3">
          <p className="text-[7.5px] tracking-widest uppercase text-gray-400 mb-1">
            Confidential · KYC Evidence Document
          </p>
          <p className="text-[13px] font-bold tracking-wider uppercase text-gray-900 mb-0.5">
            Board Resolution
          </p>

          <AnnField anchorId="entity-name" anns={anns} activeId={activeId} addMode={addMode} onSelect={onSelect} onAddClick={onAddClick}>
            <p className="text-[11px] font-semibold text-gray-800">BlackRock Group Holdings Ltd.</p>
          </AnnField>

          <p className="text-[8.5px] text-gray-500 mt-0.5">
            Company Registration No.: 0000890114 &nbsp;|&nbsp; Registered in Delaware, USA
          </p>
        </div>

        {/* Resolution metadata bar */}
        <div className="flex justify-between items-center border-t border-b border-gray-200 py-1.5 mb-2.5">
          <AnnField anchorId="resolution-date" anns={anns} activeId={activeId} addMode={addMode} onSelect={onSelect} onAddClick={onAddClick}>
            <span className="text-[8.5px] text-gray-500 uppercase tracking-wider mr-1">Dated:</span>
            <span className="font-semibold text-gray-800">15 March 2024</span>
          </AnnField>
          <span className="text-right text-gray-700">
            <span className="text-[8.5px] text-gray-500 uppercase tracking-wider mr-1">Resolution No.:</span>
            <span className="font-semibold">BR-2024-0847</span>
          </span>
        </div>

        {/* Preamble */}
        <p className="mb-2 text-gray-700">
          At a duly convened meeting of the Board of Directors of{" "}
          <strong className="font-semibold text-gray-900">BlackRock Group Holdings Ltd.</strong>{" "}
          held on <strong className="font-semibold">15 March 2024</strong> at the Company's registered
          offices at 50 Hudson Yards, New York, NY 10001, at which a quorum was present, the following
          resolutions were duly passed:
        </p>

        {/* Resolution text */}
        <p className="font-semibold text-gray-900 mb-1">RESOLVED THAT:</p>
        <p className="text-gray-700 mb-3 pl-3 border-l-2 border-gray-200">
          The following persons be and are hereby authorised as signatories for all banking, financial,
          and legal transactions conducted on behalf of the Company, with authority to bind the Company
          within the limits specified in Schedule A below:
        </p>

        {/* Signatories table */}
        <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Schedule A — Authorised Signatories
        </p>
        <table className="w-full border-collapse text-[9px] mb-3">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Name</th>
              <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Title</th>
              <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Passport No.</th>
              <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Expiry</th>
              <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Specimen</th>
            </tr>
          </thead>
          <tbody>
            {/* Fink – expired passport annotation */}
            <tr
              className={trCls("sig-fink")}
              onClick={() => {
                if (addMode) { onAddClick("sig-fink"); return; }
                const ann = getAnn("sig-fink");
                if (ann) onSelect(ann.id);
              }}
            >
              <td className="border border-gray-300 px-1.5 py-1 font-medium text-gray-900 relative">
                {getAnn("sig-fink") && (
                  <span className="absolute -top-2 -right-2 z-20 pointer-events-none">
                    <Badge ann={getAnn("sig-fink")!} activeId={activeId} onSelect={onSelect} />
                  </span>
                )}
                Lawrence D. Fink
              </td>
              <td className="border border-gray-300 px-1.5 py-1 text-gray-700">Chief Executive Officer</td>
              <td className="border border-gray-300 px-1.5 py-1 font-mono text-gray-700">US482901773</td>
              <td className="border border-gray-300 px-1.5 py-1 font-semibold text-red-600">Mar 2024 ⚠</td>
              <td className="border border-gray-300 px-1.5 py-1 italic text-[8px] text-gray-400 font-serif">L. Fink</td>
            </tr>

            {/* Kapito – no annotation */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-300 px-1.5 py-1 font-medium text-gray-900">Robert S. Kapito</td>
              <td className="border border-gray-300 px-1.5 py-1 text-gray-700">President</td>
              <td className="border border-gray-300 px-1.5 py-1 font-mono text-gray-700">US391042856</td>
              <td className="border border-gray-300 px-1.5 py-1 text-gray-700">Dec 2027</td>
              <td className="border border-gray-300 px-1.5 py-1 italic text-[8px] text-gray-400 font-serif">R. Kapito</td>
            </tr>

            {/* Small – name discrepancy annotation */}
            <tr
              className={trCls("sig-small")}
              onClick={() => {
                if (addMode) { onAddClick("sig-small"); return; }
                const ann = getAnn("sig-small");
                if (ann) onSelect(ann.id);
              }}
            >
              <td className="border border-gray-300 px-1.5 py-1 font-medium text-gray-900 relative">
                {getAnn("sig-small") && (
                  <span className="absolute -top-2 -right-2 z-20 pointer-events-none">
                    <Badge ann={getAnn("sig-small")!} activeId={activeId} onSelect={onSelect} />
                  </span>
                )}
                Martin S. Small
              </td>
              <td className="border border-gray-300 px-1.5 py-1 text-gray-700">Chief Financial Officer</td>
              <td className="border border-gray-300 px-1.5 py-1 font-mono text-gray-700">US601938472</td>
              <td className="border border-gray-300 px-1.5 py-1 text-gray-700">Aug 2026</td>
              <td className="border border-gray-300 px-1.5 py-1 italic text-[8px] text-gray-400 font-serif">M. Small</td>
            </tr>
          </tbody>
        </table>

        {/* Further resolved */}
        <AnnField anchorId="execution-clause" anns={anns} activeId={activeId} addMode={addMode} onSelect={onSelect} onAddClick={onAddClick} className="mb-3">
          <p className="text-gray-700">
            <strong className="font-semibold text-gray-900">FURTHER RESOLVED THAT</strong>{" "}
            any two of the above authorised signatories shall be required to jointly execute all
            documents, instruments, and agreements creating financial obligations exceeding{" "}
            <strong>USD 500,000</strong>, and that this authority shall remain in force until revoked
            by resolution of the Board.
          </p>
        </AnnField>

        {/* Certification / signature block */}
        <div className="border-t border-gray-300 pt-2.5 mt-1">
          <p className="text-[8.5px] text-gray-500 uppercase tracking-wider mb-3">
            Certified as a true and correct copy of the resolutions duly passed at the above-mentioned meeting
          </p>
          <div className="flex justify-between items-end">
            <AnnField anchorId="company-seal" anns={anns} activeId={activeId} addMode={addMode} onSelect={onSelect} onAddClick={onAddClick}>
              <div>
                <div className="w-24 border-b border-gray-500 mb-1 h-6" />
                <p className="text-[8.5px] text-gray-600">Company Secretary</p>
                <p className="text-[8.5px] font-semibold text-gray-800">BlackRock Group Holdings Ltd.</p>
                <p className="text-[8.5px] text-gray-500 mt-0.5">Date: ____________________</p>
              </div>
            </AnnField>
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
              <span className="text-[6.5px] text-gray-400 text-center leading-tight font-medium uppercase tracking-wider">COMPANY<br/>SEAL</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 text-[7.5px] text-gray-400">
          <span>Page 1 of 2</span>
          <span>Document ID: BR-2024-0847-KYC</span>
          <span className="font-semibold tracking-wider">CONFIDENTIAL</span>
        </div>
      </div>

      {/* ── Text-selection annotation overlays (positioned within scroll container) ── */}
      {anns
        .filter(a => a.anchorId === "text-selection" && a.selectionRect)
        .map(a => {
          const sr = a.selectionRect!;
          const isActive = a.id === activeId;
          const highlightColor =
            a.riskFlag === "high"   ? "#ef4444" :
            a.riskFlag === "medium" ? "#F2D01A" : "#3b82f6";
          return (
            <div
              key={a.id}
              style={{
                position: "absolute",
                top:    sr.top,
                left:   sr.left,
                width:  Math.max(sr.width, 24),
                height: Math.max(sr.height, 13),
                pointerEvents: "none",
                zIndex: 15,
              }}
            >
              {/* Highlight band */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 2,
                  background: highlightColor,
                  opacity: isActive ? 0.28 : 0.10,
                  transition: "opacity 0.15s",
                }}
              />
              {/* Numbered badge */}
              <button
                style={{ position: "absolute", top: -8, right: -8, pointerEvents: "auto", zIndex: 20 }}
                onClick={(e) => { e.stopPropagation(); onSelect(a.id); }}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center justify-center shadow hover:scale-105 transition-transform whitespace-nowrap ${R_BADGE[a.riskFlag]} ${isActive ? "ring-2 ring-white ring-offset-1 shadow-md" : ""}`}
                title={`Annotation ${a.number}: ${ISSUE_LBL[a.type]}`}
              >
                {R_FLAG_LABEL[a.riskFlag]}
              </button>
            </div>
          );
        })
      }
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Annotation Detail                                                   */
/* ------------------------------------------------------------------ */

function AnnDetail({
  ann, onBack, onUpdate, onResolve,
}: {
  ann:       Annotation;
  onBack:    () => void;
  onUpdate:  (id: string, updates: Partial<Annotation>) => void;
  onResolve: (id: string) => void;
}) {
  const [editing,     setEditing]     = useState(false);
  const [editComment, setEditComment] = useState(ann.comment);
  const [editType,    setEditType]    = useState(ann.type);
  const [editRisk,    setEditRisk]    = useState(ann.riskFlag);

  // Reset local state if the selected annotation changes
  const key = ann.id;
  const sc  = S_CFG[ann.status];

  const save = () => {
    onUpdate(ann.id, { comment: editComment, type: editType, riskFlag: editRisk });
    setEditing(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" key={key}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-b border-kyc-neutral-200 bg-kyc-neutral-50">
        <button onClick={onBack} className="text-kyc-neutral-600 hover:text-kyc-neutral-700 transition-colors">
          <ArrowLeft size={11} />
        </button>
        <span className="text-[10px] font-bold text-kyc-neutral-800 flex-1">#{ann.number} · {ISSUE_LBL[ann.type]}</span>
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[8px] font-semibold ${sc.cls}`}>
          {sc.icon}{sc.l}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 min-h-0">

        {/* Risk */}
        <div className="flex items-center justify-between">
          <div>
            <FieldLabel>Risk Flag</FieldLabel>
            {editing ? (
              <div className="flex gap-1 mt-0.5">
                {(["high", "medium", "low"] as RiskFlag[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setEditRisk(r)}
                    className={`flex-1 text-[8px] py-0.5 rounded border capitalize font-semibold transition-colors ${editRisk === r ? R_BADGE[r] + " border-transparent" : "border-kyc-neutral-200 text-kyc-neutral-600 hover:bg-kyc-neutral-50"}`}
                  >{r}</button>
                ))}
              </div>
            ) : (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${R_BADGE[ann.riskFlag]}`}>
                <span className="capitalize">{ann.riskFlag}</span>
              </span>
            )}
          </div>
        </div>

        {/* Field */}
        <div>
          <FieldLabel>Document Field</FieldLabel>
          <FieldVal>{ann.field}</FieldVal>
        </div>

        {/* Issue type */}
        <div>
          <FieldLabel>Issue Type</FieldLabel>
          {editing ? (
            <select
              value={editType}
              onChange={e => setEditType(e.target.value as AnnotationType)}
              className="w-full text-[9px] border border-kyc-neutral-200 rounded px-1.5 py-1 mt-0.5 focus:outline-none focus:border-kyc-blue"
            >
              {ISSUE_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ) : (
            <FieldVal>{ISSUE_LBL[ann.type]}</FieldVal>
          )}
        </div>

        {/* Comment */}
        <div>
          <FieldLabel>Review Comment</FieldLabel>
          {editing ? (
            <textarea
              value={editComment}
              onChange={e => setEditComment(e.target.value)}
              rows={6}
              className="w-full text-[9px] border border-kyc-neutral-200 rounded px-1.5 py-1 mt-0.5 resize-none focus:outline-none focus:border-kyc-blue leading-relaxed"
            />
          ) : (
            <p className="text-[9px] text-kyc-neutral-700 leading-[1.55] mt-0.5">{ann.comment}</p>
          )}
        </div>

        {/* Reviewer + date */}
        <div className="flex gap-3">
          <div className="flex-1">
            <FieldLabel>Reviewer</FieldLabel>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-4 h-4 rounded-full bg-kyc-blue text-white text-[7px] font-bold flex items-center justify-center shrink-0">
                {ann.reviewer.split(" ").map(w => w[0]).join("")}
              </span>
              <span className="text-[9px] text-kyc-neutral-800">{ann.reviewer}</span>
            </div>
          </div>
          <div>
            <FieldLabel>Date</FieldLabel>
            <FieldVal>{ann.createdAt}</FieldVal>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 border-t border-kyc-neutral-200 px-2 py-1.5 space-y-1">
        {editing ? (
          <div className="flex gap-1">
            <button onClick={save} className="flex-1 text-[9px] font-semibold py-1 bg-kyc-blue text-white rounded hover:bg-kyc-blue/90 transition-colors">
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 text-[9px] font-semibold py-1 border border-kyc-neutral-200 rounded text-kyc-neutral-600 hover:bg-kyc-neutral-50">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center gap-1 text-[9px] font-semibold py-1 border border-kyc-neutral-200 rounded text-kyc-neutral-700 hover:bg-kyc-neutral-50 transition-colors"
            >
              <Edit2 size={9} />Edit Annotation
            </button>
            {ann.status !== "resolved" && (
              <button
                onClick={() => onResolve(ann.id)}
                className="w-full flex items-center justify-center gap-1 text-[9px] font-semibold py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={9} />Mark Addressed
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Annotation Form                                                 */
/* ------------------------------------------------------------------ */

function AddAnnForm({
  anchorId, onSave, onCancel, prefillText, prefillField,
}: {
  anchorId:     AnchorId;
  onSave:       (a: Omit<Annotation, "id" | "number" | "createdAt">) => void;
  onCancel:     () => void;
  prefillText?: string;
  prefillField?: string;
}) {
  const [type,    setType]    = useState<AnnotationType>("entity-mismatch");
  const [risk,    setRisk]    = useState<RiskFlag>("medium");
  const [comment, setComment] = useState(prefillText ? `Selected: “${prefillText}”\n\n` : "");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-b border-kyc-neutral-200 bg-kyc-neutral-50">
        <button onClick={onCancel} className="text-kyc-neutral-600 hover:text-kyc-neutral-700 transition-colors">
          <ArrowLeft size={11} />
        </button>
        <span className="text-[10px] font-bold text-kyc-neutral-800">New Annotation</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 min-h-0">
        <div>
          <FieldLabel>Field</FieldLabel>
          <FieldVal>{prefillField ?? ANCHOR_LBL[anchorId]}</FieldVal>
        </div>

        <div>
          <FieldLabel>Issue Type</FieldLabel>
          <select
            value={type}
            onChange={e => setType(e.target.value as AnnotationType)}
            className="w-full text-[9px] border border-kyc-neutral-200 rounded px-1.5 py-1 mt-0.5 focus:outline-none focus:border-kyc-blue"
          >
            {ISSUE_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Risk Flag</FieldLabel>
          <div className="flex gap-1 mt-0.5">
            {(["high", "medium", "low"] as RiskFlag[]).map(r => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`flex-1 text-[8px] py-0.5 rounded border capitalize font-semibold transition-colors ${risk === r ? R_BADGE[r] + " border-transparent" : "border-kyc-neutral-200 text-kyc-neutral-600 hover:bg-kyc-neutral-50"}`}
              >{r}</button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Review Comment</FieldLabel>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={6}
            className="w-full text-[9px] border border-kyc-neutral-200 rounded px-1.5 py-1 mt-0.5 resize-none focus:outline-none focus:border-kyc-blue leading-relaxed"
          />
          <button
            onClick={() => {
              if (!comment.trim()) return;
              onSave({
                anchorId, type, riskFlag: risk, status: "open",
                field:    prefillField ?? ANCHOR_LBL[anchorId],
                comment,  reviewer: "Alex Kim",
              });
            }}
            disabled={!comment.trim()}
            className="mt-1.5 w-full flex items-center justify-center gap-1 text-[9px] font-semibold py-1 rounded border border-kyc-blue text-kyc-blue hover:bg-kyc-blue hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={10} />
            Add
          </button>
        </div>

        <div>
          <FieldLabel>Reviewer</FieldLabel>
          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-kyc-neutral-800 bg-kyc-neutral-50 border border-kyc-neutral-200 rounded-full px-1.5 py-1">
            <span className="w-3.5 h-3.5 rounded-full bg-kyc-blue text-white text-[7px] font-bold flex items-center justify-center shrink-0">AK</span>
            Alex Kim
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-kyc-neutral-200 px-2 py-1.5 flex gap-1">
        <button
          onClick={() => {
            if (!comment.trim()) return;
            onSave({
              anchorId, type, riskFlag: risk, status: "open",
              field:    prefillField ?? ANCHOR_LBL[anchorId],
              comment,  reviewer: "Alex Kim",
            });
          }}
          disabled={!comment.trim()}
          className="flex-1 text-[9px] font-semibold py-1 bg-kyc-blue text-white rounded disabled:opacity-40 hover:bg-kyc-blue/90 transition-colors"
        >
          Save Annotation
        </button>
        <button
          onClick={onCancel}
          className="flex-1 text-[9px] font-semibold py-1 border border-kyc-neutral-200 rounded text-kyc-neutral-600 hover:bg-kyc-neutral-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DocumentView                                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Annotations Dropdown                                                */
/* ------------------------------------------------------------------ */

function RelatedDocsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 border transition-colors rounded-full ${
          open
            ? "bg-kyc-navy text-white border-kyc-navy"
            : "border-kyc-neutral-200 text-kyc-neutral-700 hover:bg-kyc-neutral-50"
        }`}
      >
        Related Documents ({REL_DOCS.length})
        <ChevronDown size={9} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[220px] bg-white border border-kyc-neutral-200 shadow-lg z-50 overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto divide-y divide-kyc-neutral-100">
            {REL_DOCS.map((doc, i) => (
              <button
                key={i}
                onClick={() => setOpen(false)}
                className="w-full text-left px-2.5 py-2 hover:bg-kyc-neutral-50 transition-colors flex items-center gap-2"
              >
                <FileText size={9} className="text-kyc-neutral-600 shrink-0" />
                <span className="text-[10px] font-medium text-kyc-neutral-800 truncate">{doc.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnnotationsDropdown({
  anns, activeId, addMode, onSelect, onAdd, onCancelAdd,
}: {
  anns:        Annotation[];
  activeId:    string | null;
  addMode:     boolean;
  onSelect:    (id: string) => void;
  onAdd:       () => void;
  onCancelAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openCount = anns.filter(a => a.status === "open").length;
  const escalatedCount = anns.filter(a => a.status === "escalated").length;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 border transition-colors rounded-full ${
          open || addMode
            ? "bg-kyc-navy text-white border-kyc-navy"
            : "border-kyc-neutral-200 text-kyc-neutral-700 hover:bg-kyc-neutral-50"
        }`}
      >
        Annotations ({anns.length})
        <ChevronDown size={9} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-[240px] bg-white border border-kyc-neutral-200 shadow-lg z-50 flex flex-col overflow-hidden">

          {/* Summary pills */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-kyc-neutral-100 bg-kyc-neutral-50">
            <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
              <AlertTriangle size={7} />{escalatedCount} Escalated
            </span>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              <Clock size={7} />{openCount} Open
            </span>
          </div>

          {/* Annotation list */}
          <div className="max-h-[260px] overflow-y-auto divide-y divide-kyc-neutral-100">
            {anns.length === 0 ? (
              <p className="px-3 py-4 text-[11px] text-kyc-neutral-600 italic text-center">No annotations yet</p>
            ) : anns.map(ann => {
              const sc = S_CFG[ann.status];
              return (
                <button
                  key={ann.id}
                  onClick={() => { onSelect(ann.id); setOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 hover:bg-kyc-neutral-50 transition-colors flex items-start gap-2 ${
                    ann.id === activeId ? "bg-kyc-blue-light border-l-2 border-kyc-navy" : ""
                  }`}
                >
                  <span className={`shrink-0 mt-0.5 w-[15px] h-[15px] rounded-full text-[8px] font-bold flex items-center justify-center ${R_BADGE[ann.riskFlag]}`}>
                    {ann.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-kyc-neutral-800 leading-tight">{ISSUE_LBL[ann.type]}</p>
                    <p className="text-[8.5px] text-kyc-neutral-600 truncate mt-0.5">{ann.field}</p>
                    <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 border text-[8px] font-semibold mt-1 rounded-full ${sc.cls}`}>
                      {sc.icon}{sc.l}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add row */}
          <div className="shrink-0 border-t border-kyc-neutral-200">
            <button
              onClick={() => {
                if (addMode) { onCancelAdd(); } else { onAdd(); }
                setOpen(false);
              }}
              className={`w-full flex items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold transition-colors ${
                addMode
                  ? "text-red-600 hover:bg-red-50"
                  : "text-kyc-navy hover:bg-kyc-blue-light"
              }`}
            >
              <Plus size={10} />
              {addMode ? "Cancel annotation mode" : "Add annotation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectionPopover { x: number; y: number; text: string; }

export function DocumentView({ docName }: { docName?: string }) {
  const [anns,             setAnns]             = useState<Annotation[]>(INIT_ANNS);
  const [activeId,         setActiveId]         = useState<string | null>(null);
  const [addMode,          setAddMode]          = useState(false);
  const [addAnchor,        setAddAnchor]        = useState<AnchorId | null>(null);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopover | null>(null);
  const [selectionText,    setSelectionText]    = useState("");
  const [pendingSelRect,   setPendingSelRect]   = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const docScrollRef = useRef<HTMLDivElement>(null);

  const activeAnn  = anns.find(a => a.id === activeId) ?? null;
  const nextNumber = anns.length + 1;

  const panelView: "add" | "detail" | "list" =
    addAnchor   ? "add"    :
    activeAnn   ? "detail" :
    "list";

  const clearSel = () => {
    setSelectionPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDocMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const text = sel.toString().trim();
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // Store rect relative to the scrollable document container
      const container = docScrollRef.current;
      if (container) {
        const cr = container.getBoundingClientRect();
        setPendingSelRect({
          top:    rect.top  - cr.top  + container.scrollTop,
          left:   rect.left - cr.left,
          width:  rect.width,
          height: rect.height,
        });
      }
      setSelectionText(text);
      setSelectionPopover({ x: rect.left + rect.width / 2, y: rect.top, text });
    }, 0);
  };

  const openSelectionAnnotation = () => {
    setAddAnchor("text-selection");
    setAddMode(false);
    setActiveId(null);
    clearSel();
  };

  const handleAddClick = (anchor: AnchorId) => {
    setAddAnchor(anchor);
    setAddMode(false);
    setActiveId(null);
    clearSel();
  };

  const handleSaveNew = (data: Omit<Annotation, "id" | "number" | "createdAt">) => {
    const newAnn: Annotation = {
      ...data,
      id:        `ann-${Date.now()}`,
      number:    nextNumber,
      createdAt: "Apr 24, 2026",
      // Attach stored position for text-selection annotations
      ...(data.anchorId === "text-selection" && pendingSelRect
        ? { selectionRect: pendingSelRect }
        : {}),
    };
    setAnns(prev => [...prev, newAnn]);
    setActiveId(null);
    setAddAnchor(null);
    setAddMode(false);
    setPendingSelRect(null);
  };

  const handleUpdate = (id: string, updates: Partial<Annotation>) => {
    setAnns(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleResolve = (id: string) => {
    setAnns(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" as AnnStatus } : a));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* ── Metadata Header ── */}
      <div className="shrink-0 px-3 py-2 border-b border-kyc-neutral-200 bg-kyc-neutral-50">
        {docName && (
          <p className="text-[11px] font-semibold text-kyc-neutral-800 truncate mb-1.5">{docName}</p>
        )}
        <div className="grid grid-cols-2 gap-x-2">
          <MetaCell label="Document">BR-2024-0847</MetaCell>
          <MetaCell label="Type">Board Resolution</MetaCell>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-kyc-neutral-100 bg-white">
        <button className="flex items-center gap-1 text-[10px] font-medium text-kyc-neutral-600 hover:text-kyc-blue transition-colors">
          <Upload size={10} />Upload Evidence
        </button>
        <div className="flex items-center gap-2 relative">
          {addMode && (
            <span className="text-[9px] text-kyc-blue font-medium animate-pulse">
              Click a field in the document
            </span>
          )}
          <RelatedDocsDropdown />
          <AnnotationsDropdown
            anns={anns}
            activeId={activeId}
            addMode={addMode}
            onSelect={(id) => { setActiveId(id); setAddMode(false); setAddAnchor(null); }}
            onAdd={() => { setAddMode(true); setActiveId(null); setAddAnchor(null); }}
            onCancelAdd={() => { setAddMode(false); }}
          />
        </div>
      </div>

      {/* ── Main body ── */}
      <div
        className="flex-1 flex overflow-hidden min-h-0"
        onMouseUp={handleDocMouseUp}
        onClick={() => setSelectionPopover(null)}
      >
        {/* Selection annotation popover */}
        {selectionPopover && (
          <div
            style={{
              position: "fixed",
              left: selectionPopover.x,
              top: selectionPopover.y - 8,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
              pointerEvents: "auto",
            }}
            onMouseDown={e => e.preventDefault()}
          >
            <button
              onClick={e => { e.stopPropagation(); openSelectionAnnotation(); }}
              className="flex items-center gap-1.5 bg-kyc-navy text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl hover:bg-kyc-navy-light transition-colors whitespace-nowrap"
            >
              <Plus size={11} />
              Annotate
              <span className="text-white/50 font-normal text-[9px] max-w-[90px] truncate">
                &ldquo;{selectionText.slice(0, 22)}{selectionText.length > 22 ? "…" : ""}&rdquo;
              </span>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid hsl(var(--kyc-navy))" }} />
          </div>
        )}

        {/* Document */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <BoardResolutionDoc
            anns={anns}
            activeId={activeId}
            addMode={addMode}
            onSelect={(id) => { setActiveId(id); setAddAnchor(null); setAddMode(false); }}
            onAddClick={handleAddClick}
            containerRef={docScrollRef}
          />
        </div>

        {panelView !== "list" && (
          <div className="w-[196px] shrink-0 border-l border-kyc-neutral-200 flex flex-col overflow-hidden bg-white">
          {panelView === "add" && addAnchor && (
            <AddAnnForm
              anchorId={addAnchor}
              onSave={handleSaveNew}
              onCancel={() => setAddAnchor(null)}
              prefillText={addAnchor === "text-selection" ? selectionText : undefined}
              prefillField={addAnchor === "text-selection" ? `“${selectionText.slice(0, 40)}${selectionText.length > 40 ? "…" : ""}”` : undefined}
            />
          )}
          {panelView === "detail" && activeAnn && (
            <AnnDetail
              ann={activeAnn}
              onBack={() => setActiveId(null)}
              onUpdate={handleUpdate}
              onResolve={handleResolve}
            />
          )}
          </div>
        )}
      </div>


    </div>
  );
}
