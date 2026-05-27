import { AiReasoningPanel } from "@/components/kyc/AiReasoningPanel";
import type { AuditEntry } from "@/components/kyc/AuditLogPanel";
import type { ReachOut } from "@/components/kyc/ReachOutModal";

export type CenterReasoningWorkspaceProps = {
  activeIdx: number;
  onExceptionResolved: (idx: number, resolved: boolean) => void;
  onAuditEntry: (entry: AuditEntry) => void;
  onReachOut: (ro: ReachOut) => void;
  onOpenReachOuts: () => void;
  onOpenDocument: (name: string) => void;
};

export function CenterReasoningWorkspace({
  activeIdx,
  onExceptionResolved,
  onAuditEntry,
  onReachOut,
  onOpenReachOuts,
  onOpenDocument,
}: CenterReasoningWorkspaceProps) {
  return (
    <div
      className="flex-1 min-w-0 overflow-y-auto border-l border-r border-kyc-neutral-200"
      style={{ minHeight: 0, maxHeight: "100%" }}
    >
      <AiReasoningPanel
        activeIdx={activeIdx}
        onExceptionResolved={onExceptionResolved}
        onAuditEntry={onAuditEntry}
        onReachOut={onReachOut}
        onOpenReachOuts={onOpenReachOuts}
        onOpenDocument={onOpenDocument}
      />
    </div>
  );
}
