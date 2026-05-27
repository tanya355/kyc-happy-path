import { ExceptionsPanel } from "@/components/kyc/ExceptionsPanel";
import { LEFT_W } from "../CaseWorkspaceData";

export type LeftExceptionsPanelProps = {
  activeIdx: number;
  onSelect: (idx: number) => void;
  addressedIdxs: Set<number>;
  focusedEntity: string | null;
};

export function LeftExceptionsPanel({
  activeIdx,
  onSelect,
  addressedIdxs,
  focusedEntity,
}: LeftExceptionsPanelProps) {
  return (
    <div
      className="shrink-0 hidden lg:block overflow-y-auto"
      style={{ width: LEFT_W, minHeight: 0, maxHeight: "100%" }}
    >
      <ExceptionsPanel
        activeIdx={activeIdx}
        onSelect={onSelect}
        addressedIdxs={addressedIdxs}
        focusedEntity={focusedEntity}
      />
    </div>
  );
}
