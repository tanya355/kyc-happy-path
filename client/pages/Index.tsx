import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Maximize2, ChevronLeft, ExternalLink } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { CaseHeader, CaseStatusBar, ENTITY_META } from "@/components/kyc/CaseHeader";
import { ExceptionsPanel } from "@/components/kyc/ExceptionsPanel";
import { AiReasoningPanel } from "@/components/kyc/AiReasoningPanel";
import { ContentTreeCanvas, ReasoningDrawer, type AttrRow } from "@/components/kyc/ContentTreeCanvas";
import { DocumentView } from "@/components/kyc/DocumentView";
import { AuditLogPanel, type AuditEntry } from "@/components/kyc/AuditLogPanel";
import { ReachOutModal, type ReachOut } from "@/components/kyc/ReachOutModal";
import { EntityDetailPanel } from "@/components/kyc/EntityDetailPanel";
import { AgentReasoningWindow } from "@/components/kyc/AgentReasoningWindow";
import { AgentReviewPanel } from "@/components/kyc/AgentReviewPanel";

const LEFT_W      = 272; // fixed left panel width
const RIGHT_MIN            = 280;
const RIGHT_MAX            = 900;
const RIGHT_ENTITY_ATTRS_W = 680;
const rightDefault = () => Math.round(window.innerWidth * 0.30);

const TOTAL_EXCEPTIONS = 5;

type RightTab = "tree" | "document" | "reasoning";

const ENTITY_CASE_NUMBERS: Record<string, string> = {
  "BlackRock Advisors":      "KYC-28821",
  "BlackRock Institutional": "KYC-28834",
  "Entity 13":               "KYC-29107",
};

const DEFAULT_ENTITIES = ["BlackRock Advisors", "BlackRock Institutional", "Entity 13"];

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { caseId?: string; entity?: string; entityId?: string; singleEntity?: boolean; priority?: string } | null;

  // Single entity workflow: clicking a row passes { singleEntity: true, entity: name }
  const initialEntities = routeState?.singleEntity && routeState.entity
    ? [routeState.entity]
    : DEFAULT_ENTITIES;
  const initialFocus = routeState?.entity ?? null;

  const [docExpanded, setDocExpanded] = useState(false);
  const [activeDocName, setActiveDocName] = useState<string | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(initialEntities);
  const removeEntity = (name: string) => {
    setSelectedEntities(prev => prev.filter(e => e !== name));
    setFocusedEntity(prev => prev === name ? null : prev);
  };
  const [focusedEntity, setFocusedEntity] = useState<string | null>(initialFocus);
  const toggleFocus = (name: string) => setFocusedEntity(prev => prev === name ? null : name);

  const [activeIdx, setActiveIdx] = useState(0);
  const [rightW, setRightW] = useState(() => rightDefault());
  const [rightTab, setRightTab] = useState<RightTab>("tree");
  const [treeViewMode, setTreeViewMode] = useState<"child" | "parent">("child");
  const [selectedAttr, setSelectedAttr] = useState<AttrRow | null>(null);
  const [agentWindowOpen, setAgentWindowOpen] = useState(false);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [agentPanelCollapsed, setAgentPanelCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const handleAttrSelect = (attr: AttrRow | null) => {
    setSelectedAttr(attr);
    if (attr) {
      setRightTab("reasoning");
      setRightPanelOpen(true);
    }
  };
  const [resolvedExceptions, setResolvedExceptions] = useState<Set<number>>(new Set());

  // Reach outs
  const [reachOuts, setReachOuts] = useState<ReachOut[]>([]);
  const [reachOutOpen, setReachOutOpen] = useState(false);
  const addReachOut = (ro: ReachOut) => setReachOuts(prev => [...prev, ro]);

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => [{
    id: "session-start",
    timestamp: new Date(),
    type: "session_start",
    title: "Review session opened",
    detail: "Case #KYC-2024-8821 · BlackRock DRG Group loaded for analyst review.",
  }]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditPostSubmit, setAuditPostSubmit] = useState(false);
  const [entityDetail, setEntityDetail]       = useState<string | null>(null);

  const addAuditEntry = (entry: AuditEntry) => {
    setAuditLog(prev => [...prev, entry]);
  };

  const handleExceptionResolved = (idx: number, resolved: boolean) => {
    setResolvedExceptions(prev => {
      const next = new Set(prev);
      resolved ? next.add(idx) : next.delete(idx);
      return next;
    });
  };

  // Drag handle state
  const dragging   = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(0);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragging.current   = true;
    dragStartX.current = e.clientX;
    dragStartW.current = rightW;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      // dragging left → bigger right panel
      const delta = dragStartX.current - ev.clientX;
      setRightW(Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, dragStartW.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  }, [rightW]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <div className="flex flex-col flex-1 min-h-0">
      <TopNav />
      <CaseHeader
        resolvedCount={resolvedExceptions.size}
        totalExceptions={TOTAL_EXCEPTIONS}
        focusedEntity={focusedEntity}
        onAuditEntry={addAuditEntry}
        onOpenAuditLog={() => setAuditOpen(true)}
        onSubmitComplete={() => { setAuditPostSubmit(true); }}
        reachOutCount={reachOuts.filter(r => r.status === "pending").length}
        onOpenReachOuts={() => setReachOutOpen(true)}
        onAgentReviewReady={() => { setAgentPanelOpen(true); setAgentPanelCollapsed(false); }}
        onRunAgents={() => { setAgentWindowOpen(true); }}
      />

      {/* ── Selected Entities strip (frozen) ── */}
      <div className="shrink-0 px-6 py-3 flex items-center gap-3 border-b border-ds-neutral-200 bg-white z-10">
        <span className="text-[11px] font-semibold text-ds-neutral-600 shrink-0">
          Selected Entities
          <span className="ml-1.5 font-normal text-ds-neutral-500">({selectedEntities.length})</span>
        </span>

        <div className="w-px h-4 bg-ds-neutral-200 shrink-0" aria-hidden="true" />

        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {selectedEntities.map(name => {
            const isFocused = focusedEntity === name;
            const isOther   = focusedEntity !== null && !isFocused;
            return (
            <div
              key={name}
              className={`inline-flex items-center gap-0 rounded-lg border overflow-hidden text-[11px] transition-all ${
                isFocused
                  ? "border-ds-dark-blue-400 shadow-sm"
                  : isOther
                  ? "border-ds-neutral-200 opacity-40"
                  : "border-ds-neutral-200"
              }`}
              style={{ background: isFocused ? "var(--color-dark-blue-000)" : "var(--color-neutral-000)" }}
            >
              {/* Clickable entity name — toggles focus */}
              <button
                onClick={() => toggleFocus(name)}
                aria-pressed={isFocused}
                aria-label={isFocused ? `Unfocus ${name}` : `Focus ${name}`}
                className={`px-2.5 py-1 font-semibold leading-none transition-colors ${
                  isFocused ? "text-ds-dark-blue-600" : "text-ds-neutral-800 hover:text-ds-dark-blue-600"
                }`}
              >
                {name}
              </button>
              {/* Case number badge */}
              <span
                className="px-2 py-1 font-mono font-medium text-[11px] text-ds-dark-blue-600 leading-none border-l border-ds-neutral-200"
                style={{ background: "var(--color-dark-blue-000)" }}
              >
                {ENTITY_CASE_NUMBERS[name] ?? "—"}
              </span>
              {/* Open entity detail */}
              <button
                onClick={() => setEntityDetail(name)}
                aria-label={`View detail for ${name}`}
                className="px-1.5 py-1 text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors border-l border-ds-neutral-200 leading-none"
                title="View entity detail"
              >
                <ExternalLink size={10} aria-hidden="true" />
              </button>
              {/* Remove */}
              <button
                onClick={() => removeEntity(name)}
                aria-label={`Remove ${name}`}
                className="px-1.5 py-1 text-ds-neutral-400 hover:text-ds-neutral-700 hover:bg-ds-neutral-200 transition-colors border-l border-ds-neutral-200 leading-none focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600"
              >
                <X size={10} aria-hidden="true" />
              </button>
            </div>
            );
          })}
          {selectedEntities.length === 0 && (
            <span className="text-[11px] text-ds-neutral-500 italic">None selected</span>
          )}
        </div>

      </div>

      {/* ── Entity-level detail ribbon (shown only when entity is focused) ── */}
      {focusedEntity && ENTITY_META[focusedEntity] && (() => {
        const meta   = ENTITY_META[focusedEntity];
        const caseId = ENTITY_CASE_NUMBERS[focusedEntity] ?? "—";

        const priorityColor = meta.priority === "High" ? "var(--color-red-700)" : meta.priority === "Medium" ? "var(--color-neutral-800)" : "var(--color-neutral-600)";
        const confNum = parseFloat(meta.confidence);
        const confColor = confNum >= 85 ? "var(--color-green-700)" : confNum >= 65 ? "var(--color-neutral-800)" : "var(--color-red-700)";

        const riskColor = meta.riskLevel === "elevated" ? "var(--color-red-700)" : meta.riskLevel === "moderate" ? "var(--color-neutral-800)" : "var(--color-green-700)";

        const fields = [
          { label: "Risk Rating",   value: meta.risk,          valueStyle: { color: riskColor,                       fontWeight: 600 } },
          { label: "Customer Type", value: meta.customerType,  valueStyle: { color: "var(--color-dark-blue-700)",    fontWeight: 500 } },
          { label: "Case ID",       value: caseId,             valueStyle: { color: "var(--color-dark-blue-600)",    fontWeight: 700, fontFamily: "monospace" } },
          { label: "Priority",      value: meta.priority,      valueStyle: { color: priorityColor,                   fontWeight: 600 } },
          { label: "Due Date",      value: meta.dueDate,       valueStyle: { color: "var(--color-dark-blue-700)",    fontWeight: 600 } },
          { label: "Status",        value: meta.status,        valueStyle: { color: "var(--color-dark-blue-700)",    fontWeight: 500 } },
          { label: "Jurisdiction",  value: meta.jurisdiction,  valueStyle: { color: "var(--color-dark-blue-700)",    fontWeight: 500 } },
          { label: "Exceptions",    value: String(meta.exceptionTotal), valueStyle: { color: meta.exceptionTotal > 0 ? "var(--color-red-700)" : "var(--color-neutral-600)", fontWeight: 600 } },
          { label: "Confidence",    value: meta.confidence,    valueStyle: { color: confColor,                       fontWeight: 600 } },
        ];

        return (
          <div
            className="shrink-0 flex items-center z-10 overflow-hidden"
            style={{ background: "var(--color-dark-blue-000)", borderBottom: "1px solid var(--color-dark-blue-100)", minHeight: 34 }}
          >
            {/* Entity name label — fixed left */}
            <span className="text-[11px] font-bold text-ds-dark-blue-700 shrink-0 px-4 border-r border-ds-dark-blue-100 self-stretch flex items-center whitespace-nowrap">
              {focusedEntity}
            </span>

            {/* Scrollable fields — overflow-x-auto so they never push off screen */}
            <div className="flex items-center divide-x divide-ds-dark-blue-100 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
              {fields.map(f => (
                <div key={f.label} className="flex items-center gap-1 shrink-0 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ds-dark-blue-400 whitespace-nowrap">{f.label}</span>
                  <span className="text-[10px] whitespace-nowrap" style={f.valueStyle}>{f.value}</span>
                </div>
              ))}
            </div>

            {/* Status subway — fixed right */}
            <div className="shrink-0 px-4 border-l border-ds-dark-blue-100 self-stretch flex items-center">
              <CaseStatusBar />
            </div>
          </div>
        );
      })()}

      {/* ── 3-panel workspace ── */}
      <main className="flex-1 px-0 py-0 overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex gap-0 h-full" style={{ minHeight: 0 }}>

          {/* Left – Exceptions (fixed) */}
          <div
            className="shrink-0 hidden lg:block overflow-y-auto"
            style={{ width: LEFT_W, minHeight: 0, maxHeight: "100%" }}
          >
            <ExceptionsPanel activeIdx={activeIdx} onSelect={setActiveIdx} addressedIdxs={resolvedExceptions} focusedEntity={focusedEntity} />
          </div>

          {/* Center – AI Reasoning (flex-1, min-w-0) */}
          <div className="flex-1 min-w-0 overflow-y-auto border-l border-r border-kyc-neutral-200" style={{ minHeight: 0, maxHeight: "100%" }}>
            <AiReasoningPanel
              activeIdx={activeIdx}
              onExceptionResolved={handleExceptionResolved}
              onAuditEntry={addAuditEntry}
              onReachOut={addReachOut}
              onOpenReachOuts={() => setReachOutOpen(true)}
              onOpenDocument={(name) => {
                setActiveDocName(name);
                setRightTab("document");
                setRightW(Math.round(window.innerWidth * 0.45));
                setRightPanelOpen(true);
                addAuditEntry({
                  id: `doc-${name}-${Date.now()}`,
                  timestamp: new Date(),
                  type: "document_viewed",
                  title: `Document opened: ${name}`,
                });
              }}
            />
          </div>

          {/* Collapsed strip – shown when right panel is hidden */}
          {!rightPanelOpen && (
            <button
              onClick={() => setRightPanelOpen(true)}
              className="hidden lg:flex shrink-0 flex-col items-center gap-3 border-l cursor-pointer transition-colors group"
              style={{
                width: 44,
                background: "var(--color-neutral-000)",
                borderColor: "var(--color-neutral-200)",
                paddingTop: 14,
                paddingBottom: 14,
              }}
              title="Expand attributes panel"
              aria-label="Expand attributes panel"
            >
              <div
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors group-hover:bg-kyc-neutral-100"
                style={{ border: "1px solid var(--color-neutral-200)", background: "white" }}
              >
                <ChevronLeft size={14} style={{ color: "var(--color-dark-blue-600)" }} />
              </div>
              <span
                className="text-[9px] font-bold uppercase tracking-widest select-none flex-1"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  color: "var(--color-dark-blue-600)",
                  letterSpacing: "0.12em",
                }}
              >
                Attributes
              </span>
            </button>
          )}

          {/* Drag handle – only when panel is open */}
          {rightPanelOpen && (
            <div
              onMouseDown={onDragStart}
              className="hidden lg:flex shrink-0 w-1 cursor-col-resize bg-kyc-neutral-200 hover:bg-kyc-neutral-300 transition-colors"
              title="Drag to resize"
            />
          )}

          {/* Right – tabbed panel (resizable) */}
          {rightPanelOpen && (
          <div
            className="hidden lg:flex shrink-0 flex-col"
            style={{ width: rightW, minHeight: 0, maxHeight: "100%", transition: "width 250ms ease" }}
          >
            {/* Tab bar */}
            <div className="flex items-stretch shrink-0 border-b border-kyc-neutral-200">
              <button
                onClick={() => { setRightTab("tree"); setRightW(treeViewMode === "parent" ? RIGHT_ENTITY_ATTRS_W : rightDefault()); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                  rightTab === "tree"
                    ? "border-ds-dark-blue-500 text-ds-dark-blue-600"
                    : "border-transparent text-kyc-neutral-600 hover:text-kyc-neutral-800"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
                  <rect x="9" y="15" width="6" height="6" rx="1"/>
                  <line x1="6" y1="9" x2="6" y2="12"/><line x1="18" y1="9" x2="18" y2="12"/>
                  <line x1="6" y1="12" x2="12" y2="12"/><line x1="18" y1="12" x2="12" y2="12"/>
                  <line x1="12" y1="12" x2="12" y2="15"/>
                </svg>
                Attributes
              </button>
              <button
                onClick={() => { setRightTab("document"); setRightW(Math.round(window.innerWidth * 0.45)); setRightPanelOpen(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                  rightTab === "document"
                    ? "border-ds-dark-blue-500 text-ds-dark-blue-600"
                    : "border-transparent text-kyc-neutral-600 hover:text-kyc-neutral-800"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Document View
              </button>
              {selectedAttr && (
                <button
                  onClick={() => setRightTab("reasoning")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                    rightTab === "reasoning"
                      ? "border-ds-dark-blue-500 text-ds-dark-blue-600"
                      : "border-transparent text-kyc-neutral-600 hover:text-kyc-neutral-800"
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                  Reasoning
                </button>
              )}

              {rightTab === "document" && (
                <button
                  onClick={() => setDocExpanded(true)}
                  className="self-center p-1 rounded text-kyc-neutral-600 hover:text-ds-dark-blue-600 hover:bg-ds-dark-blue-000 transition-colors"
                  title="Expand document"
                >
                  <Maximize2 size={13} />
                </button>
              )}
              <button
                onClick={() => setRightPanelOpen(false)}
                className="ml-auto self-center mr-2 p-1 rounded text-kyc-neutral-400 hover:text-kyc-neutral-700 hover:bg-kyc-neutral-100 transition-colors"
                title="Collapse panel"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/>
                </svg>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 border border-kyc-neutral-200 border-t-0 overflow-hidden" style={{ minHeight: 0 }}>
              {rightTab === "tree" && (
                <ContentTreeCanvas
                  selectedAttr={selectedAttr}
                  onAttrSelect={handleAttrSelect}
                  onViewModeChange={mode => {
                    setTreeViewMode(mode);
                    if (mode === "parent") setRightW(w => Math.max(w, RIGHT_ENTITY_ATTRS_W));
                    else setRightW(rightDefault());
                  }}
                />
              )}
              {rightTab === "document" && (
                <DocumentView docName={activeDocName ?? undefined} />
              )}
              {rightTab === "reasoning" && selectedAttr && (
                <div className="h-full overflow-y-auto" style={{ minHeight: 0 }}>
                  <ReasoningDrawer
                    attr={selectedAttr}
                    onClose={() => { setSelectedAttr(null); setRightTab("tree"); }}
                  />
                </div>
              )}
              {rightTab === "reasoning" && !selectedAttr && (
                <div className="flex items-center justify-center h-full text-[12px] text-kyc-neutral-500">
                  Select an attribute to view reasoning
                </div>
              )}
            </div>
          </div>
          )}

          {/* Agent Review Panel – collapsible 4th column */}
          {agentPanelOpen && (
            <AgentReviewPanel
              collapsed={agentPanelCollapsed}
              onToggleCollapse={() => setAgentPanelCollapsed(c => !c)}
              onClose={() => setAgentPanelOpen(false)}
              onAllActioned={() => {}}
            />
          )}

        </div>
      </main>

      {/* ── Floating Agent Reasoning Window ── */}
      {agentWindowOpen && (
        <AgentReasoningWindow onClose={() => setAgentWindowOpen(false)} />
      )}


      {/* ── Reach Outs Modal ── */}
      {reachOutOpen && (
        <ReachOutModal
          reachOuts={reachOuts}
          onClose={() => setReachOutOpen(false)}
          onSent={() => setReachOuts(prev => prev.map(r => ({ ...r, status: "sent" as const })))}
        />
      )}

      {/* ── Entity Detail Panel ── */}
      {entityDetail && (
        <EntityDetailPanel
          entityName={entityDetail}
          caseNumber={ENTITY_CASE_NUMBERS[entityDetail] ?? "—"}
          onClose={() => setEntityDetail(null)}
        />
      )}

      {/* ── Audit Log Modal ── */}
      {auditOpen && (
        <AuditLogPanel
          entries={auditLog}
          onClose={() => { setAuditOpen(false); if (auditPostSubmit) navigate("/dashboard"); }}
          postSubmit={auditPostSubmit}
          onReturnToQueue={() => { setAuditOpen(false); navigate("/dashboard"); }}
        />
      )}

      {/* ── Document expand modal ── */}
      {docExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,16,48,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setDocExpanded(false)}
        >
          <div
            className="relative rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white"
            style={{ width: "min(1200px, 96vw)", height: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-kyc-neutral-200 bg-kyc-neutral-50">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ds-dark-blue-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="text-[13px] font-semibold text-kyc-neutral-800">Document View</span>
                <span className="text-[11px] text-kyc-neutral-600">BR-2024-0847 · BlackRock Advisors LLC</span>
              </div>
              <button
                onClick={() => setDocExpanded(false)}
                className="p-1.5 rounded-lg text-kyc-neutral-600 hover:text-kyc-neutral-800 hover:bg-kyc-neutral-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Document fills modal */}
            <div className="flex-1 overflow-hidden min-h-0">
              <DocumentView docName={activeDocName ?? undefined} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
