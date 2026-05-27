import { AuditLogPanel, type AuditEntry } from "@/components/kyc/AuditLogPanel";

export type AuditLogModalContainerProps = {
  open: boolean;
  entries: AuditEntry[];
  postSubmit: boolean;
  onClose: () => void;
  onReturnToQueue: () => void;
};

export function AuditLogModalContainer({
  open,
  entries,
  postSubmit,
  onClose,
  onReturnToQueue,
}: AuditLogModalContainerProps) {
  if (!open) return null;
  return (
    <AuditLogPanel
      entries={entries}
      onClose={onClose}
      postSubmit={postSubmit}
      onReturnToQueue={onReturnToQueue}
    />
  );
}
