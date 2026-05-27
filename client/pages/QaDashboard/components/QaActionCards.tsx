import { useState, type ReactNode, type CSSProperties } from "react";
import {
  ChevronDown, ChevronRight, AlertTriangle, TrendingDown, CheckCircle, Bot,
  Sparkles, MessageCircle, FileText, Flag, Zap, Shield, Lightbulb, ClipboardCheck,
} from "lucide-react";
import {
  ENTITY_SECTIONS,
  FILTERS,
  FILTER_CONTENT,
  confidenceColor,
  type AttributeItem,
  type FilterType,
  type FilterContentIconToken,
  type FlaggedItemWithContext,
  type RecommendationIconToken,
} from "../QaDashboardData";

const FILTER_ITEM_ICONS: Record<FilterContentIconToken, ReactNode> = {
  "alert-triangle": <AlertTriangle size={11} />,
  "trending-down":  <TrendingDown size={11} />,
  "message-circle": <MessageCircle size={11} />,
  "file-text":      <FileText size={11} />,
  "flag":           <Flag size={11} />,
};

const RECOMMENDATION_ICONS: Record<RecommendationIconToken, ReactNode> = {
  "zap":       <Zap size={11} />,
  "shield":    <Shield size={11} />,
  "lightbulb": <Lightbulb size={11} />,
  "sparkles":  <Sparkles size={11} />,
  "flag":      <Flag size={11} />,
};

interface RightPanelSectionProps {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  countStyle?: CSSProperties;
  icon: ReactNode;
  children: ReactNode;
}

function RightPanelSection({
  title, count, open, onToggle, countStyle, icon, children,
}: RightPanelSectionProps) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`right-panel-${title.replace(/\s+/g, "-")}`}
        className="w-full flex items-center gap-2 px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ background: "var(--color-neutral-000)", borderBottom: open ? "1px solid var(--color-neutral-200)" : "none", outlineColor: "var(--color-dark-blue-600)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-100)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
      >
        <span style={{ color: "var(--color-neutral-500)" }} aria-hidden>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left" style={{ color: "var(--color-neutral-700)" }}>{title}</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={countStyle ?? { background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }} aria-label={`${count} items`}>{count}</span>
        {open
          ? <ChevronDown size={11} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
          : <ChevronRight size={11} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
        }
      </button>
      {open && <div id={`right-panel-${title.replace(/\s+/g, "-")}`} className="px-3 py-2.5 space-y-1.5">{children}</div>}
    </div>
  );
}

interface FlaggedItemRowProps {
  item: FlaggedItemWithContext;
  onSelect: () => void;
}

function FlaggedItemRow({ item, onSelect }: FlaggedItemRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left flex items-start gap-2 p-2.5 rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)", outlineColor: "var(--color-dark-blue-600)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-dark-blue-400)"; e.currentTarget.style.background = "var(--color-dark-blue-000)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-neutral-200)"; e.currentTarget.style.background = "var(--color-base-white)"; }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--color-neutral-800)" }}>{item.name}</p>
        <p className="text-[9.5px] mt.0.5" style={{ color: "var(--color-neutral-700)" }}>{item.entityName} · {item.section}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {item.confidence > 0 && (
          <span className={`text-[10px] font-bold ${confidenceColor(item.confidence)}`}>{item.confidence}%</span>
        )}
        <span className="text-[9px] font-semibold" style={{ color: "var(--color-dark-blue-600)" }}>Resolve →</span>
      </div>
    </button>
  );
}

interface QaActionCardsProps {
  onSelectItem: (id: string) => void;
  activeFilter: FilterType;
}

export function QaActionCards({ onSelectItem, activeFilter }: QaActionCardsProps) {
  const allItems = ENTITY_SECTIONS.flatMap(ent =>
    [...ent.cip, ...ent.dueDiligence].flatMap(sub =>
      sub.items.map((i: AttributeItem) => ({ ...i, entityName: ent.name.split(" ").slice(0, 2).join(" "), section: sub.title }))
    )
  ) as FlaggedItemWithContext[];

  const flaggedItems = allItems.filter(i => i.action !== "none");
  const lowConfItems = allItems.filter(i => i.confidence > 0 && i.confidence < 65);

  const cfg          = FILTER_CONTENT[activeFilter];
  const filterLabel  = FILTERS.find(f => f.id === activeFilter)?.label ?? "All Flagged";

  const [flaggedOpen,  setFlaggedOpen]  = useState(true);
  const [lowConfOpen,  setLowConfOpen]  = useState(true);
  const [actionsOpen,  setActionsOpen]  = useState(true);
  const [recsOpen,     setRecsOpen]     = useState(true);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-base-white)" }}>

      <div className="shrink-0 px-5 py-3" style={{ background: "var(--color-neutral-000)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck size={13} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
            <p className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>Action &amp; Resolution</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}>
            <Sparkles size={8} aria-hidden />{filterLabel}
          </span>
        </div>
        <p className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>{flaggedItems.length} items need attention · Select any to resolve</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">

        <RightPanelSection
          title="Flagged Items"
          count={flaggedItems.length}
          open={flaggedOpen}
          onToggle={() => setFlaggedOpen(v => !v)}
          icon={<AlertTriangle size={11} />}
          countStyle={{ background: "var(--color-red-000)", color: "var(--color-red-700)", border: "1px solid var(--color-red-200)" }}
        >
          {flaggedItems.length === 0 ? (
            <p className="text-[10px] py-1" style={{ color: "var(--color-neutral-700)" }}>No flagged items.</p>
          ) : flaggedItems.map(item => (
            <FlaggedItemRow key={item.id} item={item} onSelect={() => onSelectItem(item.id)} />
          ))}
        </RightPanelSection>

        <RightPanelSection
          title="Low Confidence"
          count={lowConfItems.length}
          open={lowConfOpen}
          onToggle={() => setLowConfOpen(v => !v)}
          icon={<TrendingDown size={11} />}
          countStyle={{ background: "var(--color-yellow-000)", color: "var(--color-neutral-900)", border: "1px solid var(--color-yellow-300)" }}
        >
          {lowConfItems.length === 0 ? (
            <p className="text-[10px] py-1" style={{ color: "var(--color-neutral-700)" }}>All attributes are above the confidence threshold.</p>
          ) : lowConfItems.map(item => (
            <FlaggedItemRow key={item.id} item={item} onSelect={() => onSelectItem(item.id)} />
          ))}
        </RightPanelSection>

        <RightPanelSection
          title="Required Actions"
          count={cfg.actions.length}
          open={actionsOpen}
          onToggle={() => setActionsOpen(v => !v)}
          icon={<CheckCircle size={11} />}
        >
          {cfg.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{
                background: a.urgency === "High" ? "var(--color-red-700)" : a.urgency === "Medium" ? "var(--color-yellow-600)" : "var(--color-neutral-600)"
              }} />
              <p className="text-[10px] leading-snug flex-1" style={{ color: "var(--color-neutral-800)" }}>{a.label}</p>
              <span className="text-[9px] font-bold shrink-0" style={{
                color: a.urgency === "High" ? "var(--color-red-700)" : a.urgency === "Medium" ? "var(--color-neutral-700)" : "var(--color-neutral-700)"
              }}>{a.urgency}</span>
            </div>
          ))}
        </RightPanelSection>

        <RightPanelSection
          title="QA Recommendations"
          count={cfg.recommendations.length}
          open={recsOpen}
          onToggle={() => setRecsOpen(v => !v)}
          icon={<Bot size={11} />}
          countStyle={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}
        >
          {cfg.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg text-[10px] leading-snug"
              style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)", color: "var(--color-neutral-700)" }}>
              <span style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0 mt-0.5" aria-hidden>{RECOMMENDATION_ICONS[r.iconToken]}</span>
              {r.text}
            </div>
          ))}
        </RightPanelSection>

      </div>
    </div>
  );
}

export { FILTER_ITEM_ICONS };
