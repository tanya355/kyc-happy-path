import { ChevronDown, ChevronRight, CheckCircle } from "lucide-react";
import { BeneficialOwnersView } from "@/components/kyc/BeneficialOwnersView";
import {
  applyFilter,
  confidenceColor,
  type AttributeItem,
  type EntitySection,
  type FilterType,
  type Subsection,
} from "../QaDashboardData";

interface SubsectionRowProps {
  sub: Subsection;
  expanded: boolean;
  selectedItemId: string | null;
  selectedOwnerId: string | null;
  onToggle: () => void;
  onSelectItem: (id: string) => void;
  onSelectOwner: (id: string) => void;
  filter: FilterType;
}

function SubsectionRow({
  sub, expanded, selectedItemId, onToggle, onSelectItem, onSelectOwner, selectedOwnerId, filter,
}: SubsectionRowProps) {
  const isTableMode    = !!sub.ownerRows;
  const verifiedItems  = sub.items.filter((i: AttributeItem) => i.action === "none");
  const filteredFlagged = applyFilter(sub.items, filter);
  const allFlagged      = sub.items.filter((i: AttributeItem) => i.action !== "none");
  const hasIssues       = allFlagged.length > 0 || (sub.missing ?? 0) > 0 || (sub.needReview ?? 0) > 0;
  const matchCount      = filteredFlagged.length + (sub.needReview ?? 0);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`subsection-panel-${sub.title.replace(/\s+/g, "-")}`}
        className="w-full flex items-center gap-2 px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ borderBottom: "1px solid var(--color-neutral-100)", outlineColor: "var(--color-dark-blue-600)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
        onMouseLeave={e => (e.currentTarget.style.background = "")}
      >
        {expanded
          ? <ChevronDown size={10} style={{ color: "var(--color-neutral-500)" }} className="shrink-0" aria-hidden />
          : <ChevronRight size={10} style={{ color: "var(--color-neutral-500)" }} className="shrink-0" aria-hidden />}
        <span className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-700)" }}>{sub.title}</span>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }} aria-hidden>{sub.attrs}</span>
        <div className="flex-1" />
        {hasIssues && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--color-red-700)", background: "var(--color-red-000)", border: "1px solid var(--color-red-200)" }} aria-label={`${matchCount > 0 ? matchCount : allFlagged.length} flagged items`}>
            {matchCount > 0 ? `${matchCount} flagged` : `${allFlagged.length} flagged`}
          </span>
        )}
      </button>
      {expanded && (
        <div id={`subsection-panel-${sub.title.replace(/\s+/g, "-")}`} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
          {isTableMode ? (
            <BeneficialOwnersView rows={sub.ownerRows!} selectedId={selectedOwnerId} onSelect={onSelectOwner} />
          ) : (
            <>
              {filteredFlagged.map((item: AttributeItem) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className="w-full text-left flex items-start justify-between gap-3 px-6 py-2.5 transition-colors"
                    style={{
                      borderBottom: "1px solid var(--color-neutral-100)",
                      borderLeft: isSelected ? "3px solid var(--color-dark-blue-600)" : "3px solid transparent",
                      background: isSelected ? "var(--color-dark-blue-000)" : "var(--color-base-white)",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--color-neutral-000)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--color-base-white)"; }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-tight" style={{ color: isSelected ? "var(--color-dark-blue-600)" : "var(--color-neutral-800)" }}>{item.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--color-neutral-600)" }}>{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {item.confidence > 0 && (
                        <span className={`text-[10px] font-semibold ${confidenceColor(item.confidence)}`}>{item.confidence}%</span>
                      )}
                      <span className="text-[9px] font-semibold rounded-full px-2 py-0.5" style={{ border: "1px solid var(--color-neutral-300)", color: "var(--color-neutral-700)" }}>Resolve</span>
                    </div>
                  </button>
                );
              })}
              {filteredFlagged.length === 0 && allFlagged.length > 0 && (
                <p className="px-6 py-2 text-[10px] italic" style={{ color: "var(--color-neutral-400)" }}>No {filter === "all" ? "flagged" : filter.replace("-", " ")} items in this section</p>
              )}
              {verifiedItems.length > 0 && (
                <div className="flex items-center gap-2 px-6 py-1" style={{ borderTop: filteredFlagged.length > 0 ? "1px solid var(--color-neutral-100)" : undefined }}>
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-neutral-600)" }}>Verified · {verifiedItems.length}</span>
                </div>
              )}
              {verifiedItems.map((item: AttributeItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-6 py-1.5"
                  style={{ borderBottom: "1px solid var(--color-neutral-100)", borderLeft: "3px solid transparent" }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle size={10} style={{ color: "var(--color-green-700)", flexShrink: 0 }} aria-hidden />
                    <p className="text-[10.5px] truncate" style={{ color: "var(--color-neutral-700)" }}>{item.name}</p>
                    <p className="text-[10px] truncate hidden sm:block" style={{ color: "var(--color-neutral-700)" }}>{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--color-green-700)" }}>{item.confidence}%</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface QaEntitySectionTreeProps {
  entity: EntitySection;
  expandedSubs: Set<string>;
  selectedItemId: string | null;
  selectedOwnerId: string | null;
  onToggleSub: (id: string) => void;
  onSelectItem: (id: string) => void;
  onSelectOwner: (id: string) => void;
  filter: FilterType;
}

export function QaEntitySectionTree({
  entity, expandedSubs, selectedItemId, selectedOwnerId, onToggleSub, onSelectItem, onSelectOwner, filter,
}: QaEntitySectionTreeProps) {
  return (
    <div>
      {[...entity.cip, ...entity.dueDiligence].map(sub => (
        <SubsectionRow
          key={sub.id} sub={sub} expanded={expandedSubs.has(sub.id)}
          selectedItemId={selectedItemId} selectedOwnerId={selectedOwnerId}
          onToggle={() => onToggleSub(sub.id)} onSelectItem={onSelectItem} onSelectOwner={onSelectOwner}
          filter={filter}
        />
      ))}
    </div>
  );
}
