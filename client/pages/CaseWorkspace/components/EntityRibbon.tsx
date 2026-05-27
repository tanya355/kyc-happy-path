import { CaseStatusBar, ENTITY_META } from "@/components/kyc/CaseHeader";

export type EntityRibbonProps = {
  focusedEntity: string;
  entityCaseNumbers: Record<string, string>;
};

export function EntityRibbon({ focusedEntity, entityCaseNumbers }: EntityRibbonProps) {
  const meta = ENTITY_META[focusedEntity];
  if (!meta) return null;

  const caseId = entityCaseNumbers[focusedEntity] ?? "—";

  const priorityColor =
    meta.priority === "High"
      ? "var(--color-red-700)"
      : meta.priority === "Medium"
        ? "var(--color-neutral-800)"
        : "var(--color-neutral-600)";
  const confNum = parseFloat(meta.confidence);
  const confColor =
    confNum >= 85
      ? "var(--color-green-700)"
      : confNum >= 65
        ? "var(--color-neutral-800)"
        : "var(--color-red-700)";

  const riskColor =
    meta.riskLevel === "elevated"
      ? "var(--color-red-700)"
      : meta.riskLevel === "moderate"
        ? "var(--color-neutral-800)"
        : "var(--color-green-700)";

  const fields = [
    { label: "Risk Rating", value: meta.risk, valueStyle: { color: riskColor, fontWeight: 600 } },
    { label: "Customer Type", value: meta.customerType, valueStyle: { color: "var(--color-dark-blue-700)", fontWeight: 500 } },
    { label: "Case ID", value: caseId, valueStyle: { color: "var(--color-dark-blue-600)", fontWeight: 700, fontFamily: "monospace" } },
    { label: "Priority", value: meta.priority, valueStyle: { color: priorityColor, fontWeight: 600 } },
    { label: "Due Date", value: meta.dueDate, valueStyle: { color: "var(--color-dark-blue-700)", fontWeight: 600 } },
    { label: "Status", value: meta.status, valueStyle: { color: "var(--color-dark-blue-700)", fontWeight: 500 } },
    { label: "Jurisdiction", value: meta.jurisdiction, valueStyle: { color: "var(--color-dark-blue-700)", fontWeight: 500 } },
    { label: "Exceptions", value: String(meta.exceptionTotal), valueStyle: { color: meta.exceptionTotal > 0 ? "var(--color-red-700)" : "var(--color-neutral-600)", fontWeight: 600 } },
    { label: "Confidence", value: meta.confidence, valueStyle: { color: confColor, fontWeight: 600 } },
  ];

  return (
    <div
      className="shrink-0 flex items-center z-10 overflow-hidden"
      style={{ background: "var(--color-dark-blue-000)", borderBottom: "1px solid var(--color-dark-blue-100)", minHeight: 34 }}
    >
      <span className="text-[11px] font-bold text-ds-dark-blue-700 shrink-0 px-4 border-r border-ds-dark-blue-100 self-stretch flex items-center whitespace-nowrap">
        {focusedEntity}
      </span>

      <div className="flex items-center divide-x divide-ds-dark-blue-100 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-1 shrink-0 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ds-dark-blue-400 whitespace-nowrap">{f.label}</span>
            <span className="text-[10px] whitespace-nowrap" style={f.valueStyle}>{f.value}</span>
          </div>
        ))}
      </div>

      <div className="shrink-0 px-4 border-l border-ds-dark-blue-100 self-stretch flex items-center">
        <CaseStatusBar />
      </div>
    </div>
  );
}
