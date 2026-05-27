import { ReachOutModal, type ReachOut } from "@/components/kyc/ReachOutModal";

export type ReachOutsModalContainerProps = {
  open: boolean;
  reachOuts: ReachOut[];
  onClose: () => void;
  onSent: () => void;
};

export function ReachOutsModalContainer({
  open,
  reachOuts,
  onClose,
  onSent,
}: ReachOutsModalContainerProps) {
  if (!open) return null;
  return <ReachOutModal reachOuts={reachOuts} onClose={onClose} onSent={onSent} />;
}
