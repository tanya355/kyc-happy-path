import { FileText, Globe, Maximize2, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import type { CollabIconName, CollabItem } from "../AnalystDashboardData";

type CollaborationFeedProps = {
  items: CollabItem[];
  onExpand: () => void;
};

function renderCollabIcon(name: CollabIconName): ReactNode {
  switch (name) {
    case "message":
      return <MessageSquare size={13} className="text-ds-dark-blue-600" />;
    case "globe":
      return <Globe size={13} className="text-ds-dark-blue-500" />;
    case "file":
      return <FileText size={13} className="text-ds-neutral-500" />;
  }
}

export function CollaborationFeed({ items, onExpand }: CollaborationFeedProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "var(--color-base-white)",
        border: "1px solid var(--color-neutral-200)",
        boxShadow: "var(--shadow-000)",
        borderRadius: 8,
        flex: "2 1 0",
        minHeight: 0,
      }}
    >
      <div className="px-4 pt-4 pb-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-bold text-ds-neutral-900">
            Collaboration & Insights
          </h2>
          <button
            onClick={onExpand}
            className="w-6 h-6 flex items-center justify-center rounded text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors"
            title="Expand panel"
          >
            <Maximize2 size={12} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {items.map((c, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded ${c.bg} border border-ds-neutral-100 flex items-center justify-center shrink-0`}
              >
                {renderCollabIcon(c.iconName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-ds-neutral-900 leading-snug">
                  {c.text}
                </p>
                <p className="text-[10px] text-ds-neutral-600 mt-0.5">
                  {c.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { renderCollabIcon };
