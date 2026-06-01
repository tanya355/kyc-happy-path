import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { CaseHeader } from "@/components/kyc/CaseHeader";
import { ReasoningDrawer, type AttrRow } from "@/components/kyc/ContentTreeCanvas";
import { DocumentView } from "@/components/kyc/DocumentView";
import type { AuditEntry } from "@/components/kyc/AuditLogPanel";
import type { ReachOut } from "@/components/kyc/ReachOutModal";
import { EntityDetailPanel } from "@/components/kyc/EntityDetailPanel";
import { AgentReasoningWindow } from "@/components/kyc/AgentReasoningWindow";

import {
  RIGHT_MIN,
  RIGHT_MAX,
  RIGHT_ENTITY_ATTRS_W,
  TOTAL_EXCEPTIONS,
  getCaseWorkspaceViewModel,
  type RightTab,
} from "./CaseWorkspaceData";
import { SelectedEntitiesStrip } from "./components/SelectedEntitiesStrip";
import { EntityRibbon } from "./components/EntityRibbon";
import { LeftExceptionsPanel } from "./components/LeftExceptionsPanel";
import { CenterReasoningWorkspace } from "./components/CenterReasoningWorkspace";
import { RightDocumentPane } from "./components/RightDocumentPane";
import { ReachOutsModalContainer } from "./components/ReachOutsModalContainer";
import { AuditLogModalContainer } from "./components/AuditLogModalContainer";

const rightDefault = () => Math.round(window.innerWidth * 0.3);

type RouteState = {
  caseId?: string;
  entity?: string;
  entityId?: string;
  singleEntity?: boolean;
  priority?: string;
} | null;

export default function CaseWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as RouteState;

  const seed = getCaseWorkspaceViewModel();

  const initialEntities =
    routeState?.singleEntity && routeState.entity
      ? [routeState.entity]
      : seed.defaultEntities;
  const initialFocus = routeState?.entity ?? null;

  const [docExpanded, setDocExpanded] = useState(false);
  const [activeDocName, setActiveDocName] = useState<string | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(initialEntities);
  const [focusedEntity, setFocusedEntity] = useState<string | null>(initialFocus);

  const removeEntity = (name: string) => {
    setSelectedEntities((prev) => prev.filter((e) => e !== name));
    setFocusedEntity((prev) => (prev === name ? null : prev));
  };
  const toggleFocus = (name: string) =>
    setFocusedEntity((prev) => (prev === name ? null : name));

  const [activeIdx, setActiveIdx] = useState(0);
  const [rightW, setRightW] = useState(() => rightDefault());
  const [rightTab, setRightTab] = useState<RightTab>("tree");
  const [treeViewMode, setTreeViewMode] = useState<"child" | "parent">("child");
  const [selectedAttr, setSelectedAttr] = useState<AttrRow | null>(null);
  const [agentWindowOpen, setAgentWindowOpen] = useState(true);

  const handleAttrSelect = (attr: AttrRow | null) => {
    setSelectedAttr(attr);
  };
  const [resolvedExceptions, setResolvedExceptions] = useState<Set<number>>(new Set());

  const [reachOuts, setReachOuts] = useState<ReachOut[]>([]);
  const [reachOutOpen, setReachOutOpen] = useState(false);
  const addReachOut = (ro: ReachOut) => setReachOuts((prev) => [...prev, ro]);

  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => [
    {
      id: "session-start",
      timestamp: new Date(),
      type: "session_start",
      title: "Review session opened",
      detail: "Case #KYC-2024-8821 · BlackRock DRG Group loaded for analyst review.",
    },
  ]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditPostSubmit, setAuditPostSubmit] = useState(false);
  const [entityDetail, setEntityDetail] = useState<string | null>(null);

  const addAuditEntry = (entry: AuditEntry) => {
    setAuditLog((prev) => [...prev, entry]);
  };

  const handleExceptionResolved = (idx: number, resolved: boolean) => {
    setResolvedExceptions((prev) => {
      const next = new Set(prev);
      resolved ? next.add(idx) : next.delete(idx);
      return next;
    });
  };

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(0);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      dragStartX.current = e.clientX;
      dragStartW.current = rightW;

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
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
    },
    [rightW],
  );

  const handleOpenDocument = (name: string) => {
    setActiveDocName(name);
    setRightTab("document");
    setRightW(Math.round(window.innerWidth * 0.45));
    addAuditEntry({
      id: `doc-${name}-${Date.now()}`,
      timestamp: new Date(),
      type: "document_viewed",
      title: `Document opened: ${name}`,
    });
  };

  const handleSelectTreeTab = () => {
    setRightTab("tree");
    setRightW(treeViewMode === "parent" ? RIGHT_ENTITY_ATTRS_W : rightDefault());
  };

  const handleSelectDocumentTab = () => {
    setRightTab("document");
    setRightW(Math.round(window.innerWidth * 0.45));
  };

  const handleViewModeChange = (mode: "child" | "parent") => {
    setTreeViewMode(mode);
    if (mode === "parent") setRightW((w) => Math.max(w, RIGHT_ENTITY_ATTRS_W));
    else setRightW(rightDefault());
  };

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
          onSubmitComplete={() => {
            setAuditPostSubmit(true);
          }}
          reachOutCount={reachOuts.filter((r) => r.status === "pending").length}
          onOpenReachOuts={() => setReachOutOpen(true)}
        />

        <SelectedEntitiesStrip
          selectedEntities={selectedEntities}
          focusedEntity={focusedEntity}
          entityCaseNumbers={seed.entityCaseNumbers}
          onToggleFocus={toggleFocus}
          onOpenEntityDetail={(name) => setEntityDetail(name)}
          onRemoveEntity={removeEntity}
        />

        {focusedEntity && (
          <EntityRibbon
            focusedEntity={focusedEntity}
            entityCaseNumbers={seed.entityCaseNumbers}
          />
        )}

        <main className="flex-1 px-0 py-0 overflow-hidden" style={{ minHeight: 0 }}>
          <div className="flex gap-0 h-full" style={{ minHeight: 0 }}>
            <LeftExceptionsPanel
              activeIdx={activeIdx}
              onSelect={setActiveIdx}
              addressedIdxs={resolvedExceptions}
              focusedEntity={focusedEntity}
            />

            <CenterReasoningWorkspace
              activeIdx={activeIdx}
              onExceptionResolved={handleExceptionResolved}
              onAuditEntry={addAuditEntry}
              onReachOut={addReachOut}
              onOpenReachOuts={() => setReachOutOpen(true)}
              onOpenDocument={handleOpenDocument}
            />

            <div
              onMouseDown={onDragStart}
              className="hidden lg:flex shrink-0 w-1 cursor-col-resize bg-kyc-neutral-200 hover:bg-kyc-neutral-300 transition-colors"
              title="Drag to resize"
            />

            <RightDocumentPane
              rightW={rightW}
              rightTab={rightTab}
              activeDocName={activeDocName}
              selectedAttr={selectedAttr}
              onSelectTreeTab={handleSelectTreeTab}
              onSelectDocumentTab={handleSelectDocumentTab}
              onAttrSelect={handleAttrSelect}
              onViewModeChange={handleViewModeChange}
              onExpandDocument={() => setDocExpanded(true)}
            />
          </div>
        </main>

        {agentWindowOpen && (
          <AgentReasoningWindow onClose={() => setAgentWindowOpen(false)} />
        )}

        {selectedAttr && (
          <div
            className="fixed inset-0 z-[280] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Agent reasoning for ${selectedAttr.label}`}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(0,16,48,0.45)", backdropFilter: "blur(3px)" }}
              onClick={() => setSelectedAttr(null)}
              aria-hidden="true"
            />
            <div
              className="relative flex flex-col overflow-hidden"
              style={{
                width: "min(440px, 96vw)",
                height: "min(80vh, 700px)",
                borderRadius: 12,
                boxShadow: "0 8px 40px rgba(0,16,48,0.18)",
                border: "1px solid var(--color-neutral-200)",
              }}
            >
              <ReasoningDrawer attr={selectedAttr} onClose={() => setSelectedAttr(null)} />
            </div>
          </div>
        )}

        <ReachOutsModalContainer
          open={reachOutOpen}
          reachOuts={reachOuts}
          onClose={() => setReachOutOpen(false)}
          onSent={() =>
            setReachOuts((prev) => prev.map((r) => ({ ...r, status: "sent" as const })))
          }
        />

        {entityDetail && (
          <EntityDetailPanel
            entityName={entityDetail}
            caseNumber={seed.entityCaseNumbers[entityDetail] ?? "—"}
            onClose={() => setEntityDetail(null)}
          />
        )}

        <AuditLogModalContainer
          open={auditOpen}
          entries={auditLog}
          postSubmit={auditPostSubmit}
          onClose={() => {
            setAuditOpen(false);
            if (auditPostSubmit) navigate("/dashboard");
          }}
          onReturnToQueue={() => {
            setAuditOpen(false);
            navigate("/dashboard");
          }}
        />

        {docExpanded && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,16,48,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDocExpanded(false)}
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white"
              style={{ width: "min(1200px, 96vw)", height: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
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
