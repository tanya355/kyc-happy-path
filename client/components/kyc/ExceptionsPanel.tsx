import { CheckCircle2, Building2 } from "lucide-react";

const ENTITY_CASE_NUMBERS: Record<string, string> = {
  "BlackRock Advisors":      "KYC-28821",
  "BlackRock Institutional": "KYC-28834",
  "Entity 13":               "KYC-29107",
};

export interface Exception {
  entity: string;
  status: "Incomplete" | "Resolved";
  title: string;
  body: string;
  confidence: number;
  type: "discrepancy" | "missing-doc" | "validation";
  derivation: "agent" | "system" | "manual";
}

export const exceptions: Exception[] = [
  {
    entity: "BlackRock Advisors",
    status: "Incomplete",
    title: "Quick Validation",
    body: "Minor title difference found for Authorized Signatory 'Sarah Williams' across two entities.",
    confidence: 90,
    type: "discrepancy",
    derivation: "agent",
  },
  {
    entity: "BlackRock Institutional",
    status: "Incomplete",
    title: "Quick Validation",
    body: "Minor title difference found for Authorized Signatory 'Sarah Williams' across two entities.",
    confidence: 95,
    type: "discrepancy",
    derivation: "agent",
  },
  {
    entity: "BlackRock Institutional",
    status: "Incomplete",
    title: "Missing Document",
    body: "The updated Offering Memorandum for this fund is required for full validation.",
    confidence: 75,
    type: "missing-doc",
    derivation: "system",
  },
  {
    entity: "BlackRock Institutional",
    status: "Incomplete",
    title: "Second Exception",
    body: "Lorem Ipsum dolor sit amet, consectetur adipiscing elit.",
    confidence: 75,
    type: "validation",
    derivation: "agent",
  },
  {
    entity: "Entity 13",
    status: "Incomplete",
    title: "Third Exception",
    body: "Lorem Ipsum dolor sit amet, consectetur adipiscing elit.",
    confidence: 99,
    type: "validation",
    derivation: "agent",
  },
];

interface ExceptionsPanelProps {
  activeIdx: number;
  onSelect: (idx: number) => void;
  addressedIdxs?: Set<number>;
  focusedEntity?: string | null;
}

export function ExceptionsPanel({ activeIdx, onSelect, addressedIdxs = new Set(), focusedEntity }: ExceptionsPanelProps) {
  const visibleExceptions = focusedEntity
    ? exceptions.filter(e => e.entity === focusedEntity)
    : exceptions;
  const incomplete = visibleExceptions.filter((e) => e.status === "Incomplete").length;

  return (
    <div className="overflow-hidden flex flex-col h-full bg-white">

      {/* Panel header */}
      <div
        className="min-h-[44px] px-4 py-3 flex items-center justify-between bg-white w-full shrink-0 border-b border-kyc-neutral-200"
      >
        <div className="flex items-center gap-2">
          {/* Fluent UI Sparkle — matches AI Reasoning panel header */}
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-kyc-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2.5 L10.55 4.967 A4.25 4.25 0 0 0 13.555 7.972 L16 8.5 L13.555 9.028 A4.25 4.25 0 0 0 10.55 12.033 L10 14.5 L9.45 12.033 A4.25 4.25 0 0 0 6.445 9.028 L4 8.5 L6.445 7.972 A4.25 4.25 0 0 0 9.45 4.967 Z" />
            <path d="M4 2 L4.22 2.88 A1.5 1.5 0 0 0 4.88 3.78 L5.5 4 L4.88 4.22 A1.5 1.5 0 0 0 4.22 5.12 L4 6 L3.78 5.12 A1.5 1.5 0 0 0 3.12 4.22 L2.5 4 L3.12 3.78 A1.5 1.5 0 0 0 3.78 2.88 Z" />
            <path d="M16 11 L16.18 11.72 A1.25 1.25 0 0 0 16.78 12.82 L17.5 13 L16.78 13.18 A1.25 1.25 0 0 0 16.18 14.28 L16 15 L15.82 14.28 A1.25 1.25 0 0 0 15.22 13.18 L14.5 13 L15.22 12.82 A1.25 1.25 0 0 0 15.82 11.72 Z" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-kyc-neutral-700">
            Exceptions ({incomplete}{focusedEntity ? ` · ${focusedEntity.split(" ").slice(-1)[0]}` : ""})
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-kyc-neutral-200 flex-1 overflow-y-auto">
          {exceptions.map((ex, i) => {
            const isActive    = i === activeIdx;
            const isAddressed = addressedIdxs.has(i);
            const isDimmed    = !!focusedEntity && ex.entity !== focusedEntity;

            return (
              <li
                key={i}
                className={`border-l-[3px] transition-all ${
                  isDimmed      ? "border-l-transparent bg-white opacity-30 pointer-events-none" :
                  isActive      ? "border-l-ds-dark-blue-500 bg-ds-dark-blue-000" :
                  isAddressed   ? "border-l-ds-green-700 bg-ds-green-000" :
                                  "border-l-transparent bg-white"
                }`}
              >
                {/* Single unified row */}
                <div
                  className={`flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-kyc-neutral-50 transition-colors ${isActive ? "bg-ds-dark-blue-000" : ""}`}
                  onClick={() => !isDimmed && onSelect(i)}
                >
                  <div className="flex-1 min-w-0">
                    {/* Title + confidence pill */}
                    <div className="flex items-baseline justify-between gap-1 mb-0.5">
                      <span className={`text-[12px] font-semibold truncate ${
                        isActive    ? "text-ds-dark-blue-700"   :
                        isAddressed ? "text-kyc-neutral-600"   :
                                      "text-kyc-neutral-800"
                      }`}>
                        {ex.title}
                      </span>
                      {!isAddressed && ex.derivation === "agent" && (
                        <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[11px] font-medium border shrink-0 ${
                          ex.confidence >= 95 ? "bg-ds-green-000 text-ds-green-700 border-ds-green-100"
                            : ex.confidence >= 80 ? "bg-ds-yellow-000 text-ds-neutral-700 border-ds-yellow-300"
                            : "bg-ds-red-000 text-ds-red-700 border-ds-red-200"
                        }`}>
                          {ex.confidence}%
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1 mb-1">
                      {isAddressed ? (
                        <>
                          <CheckCircle2 size={10} className="text-ds-green-700" />
                          <span className="text-[11px] text-ds-green-700 font-medium">Addressed</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-ds-yellow-600 inline-block" />
                          <span className="text-[11px] text-kyc-neutral-600">Pending</span>
                        </>
                      )}
                    </div>

                    {/* Entity + case number */}
                    <div className="inline-flex items-center gap-0 rounded border border-ds-neutral-200 overflow-hidden w-fit">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-ds-neutral-500 font-medium leading-none">
                        <Building2 size={8} aria-hidden="true" className="shrink-0 text-ds-neutral-400" />
                        {ex.entity}
                      </span>
                      <span
                        className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-ds-dark-blue-600 leading-none border-l border-ds-neutral-200"
                        style={{ background: "var(--color-dark-blue-000)" }}
                      >
                        {ENTITY_CASE_NUMBERS[ex.entity] ?? "—"}
                      </span>
                    </div>


                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
