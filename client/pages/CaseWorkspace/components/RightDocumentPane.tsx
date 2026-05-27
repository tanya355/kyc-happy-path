import { Maximize2 } from "lucide-react";
import { ContentTreeCanvas, type AttrRow } from "@/components/kyc/ContentTreeCanvas";
import { DocumentView } from "@/components/kyc/DocumentView";
import type { RightTab } from "../CaseWorkspaceData";

export type RightDocumentPaneProps = {
  rightW: number;
  rightTab: RightTab;
  activeDocName: string | null;
  selectedAttr: AttrRow | null;
  onSelectTreeTab: () => void;
  onSelectDocumentTab: () => void;
  onAttrSelect: (attr: AttrRow | null) => void;
  onViewModeChange: (mode: "child" | "parent") => void;
  onExpandDocument: () => void;
};

export function RightDocumentPane({
  rightW,
  rightTab,
  activeDocName,
  selectedAttr,
  onSelectTreeTab,
  onSelectDocumentTab,
  onAttrSelect,
  onViewModeChange,
  onExpandDocument,
}: RightDocumentPaneProps) {
  return (
    <div
      className="hidden lg:flex shrink-0 flex-col"
      style={{ width: rightW, minHeight: 0, maxHeight: "100%", transition: "width 250ms ease" }}
    >
      <div className="flex items-stretch shrink-0 border-b border-kyc-neutral-200">
        <button
          onClick={onSelectTreeTab}
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
          onClick={onSelectDocumentTab}
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

        {rightTab === "document" && (
          <button
            onClick={onExpandDocument}
            className="ml-auto self-center mr-2 p-1 rounded text-kyc-neutral-600 hover:text-ds-dark-blue-600 hover:bg-ds-dark-blue-000 transition-colors"
            title="Expand document"
          >
            <Maximize2 size={13} />
          </button>
        )}
      </div>

      <div className="flex-1 border border-kyc-neutral-200 border-t-0 overflow-hidden" style={{ minHeight: 0 }}>
        {rightTab === "tree" && (
          <ContentTreeCanvas
            selectedAttr={selectedAttr}
            onAttrSelect={onAttrSelect}
            onViewModeChange={onViewModeChange}
          />
        )}
        {rightTab === "document" && (
          <DocumentView docName={activeDocName ?? undefined} />
        )}
      </div>
    </div>
  );
}
