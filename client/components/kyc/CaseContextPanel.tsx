import { FileText, Sparkles, Mail, BarChart3, ExternalLink, Download } from "lucide-react";

const aiCapabilities = [
  {
    icon: Sparkles,
    label: "Run independent QC agent",
    description: "Automatically verify all entity data points",
  },
  {
    icon: Mail,
    label: "Initiate client outreach",
    description: "Draft and send a compliance request email",
  },
  {
    icon: BarChart3,
    label: "Generate case report",
    description: "Export a full PDF summary of this case",
  },
];

const sourceDocuments = [
  { name: "Fund Charter.pdf", page: "Pg. 3", available: true },
  { name: "Form ADV.pdf", page: "Pg. 12", available: true },
  { name: "Offering Memorandum.pdf", page: "—", available: false },
];

export function CaseContextPanel() {
  return (
    <div className="space-y-4">
      {/* AI Capabilities */}
      <div className="bg-white rounded-md border border-kyc-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-kyc-neutral-200 bg-kyc-neutral-50 flex items-center gap-2">
          <Sparkles size={14} className="text-kyc-navy" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-kyc-neutral-700">
            AI Capabilities
          </span>
        </div>

        <div className="p-3 space-y-2">
          {aiCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.label}
                className="w-full text-left flex items-start gap-3 px-3 py-3 rounded-md border border-kyc-neutral-200 bg-white hover:bg-kyc-blue-light hover:border-kyc-blue-mid transition-colors group"
              >
                <div className="w-8 h-8 rounded bg-kyc-blue-light group-hover:bg-white border border-kyc-blue-mid/40 flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={14} className="text-kyc-blue" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-kyc-neutral-800 group-hover:text-kyc-blue transition-colors">
                    {cap.label}
                  </div>
                  <div className="text-xs text-kyc-neutral-600 mt-0.5 leading-relaxed">
                    {cap.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Documents */}
      <div className="bg-white rounded-md border border-kyc-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-kyc-neutral-200 bg-kyc-neutral-50 flex items-center gap-2">
          <FileText size={14} className="text-kyc-neutral-700" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-kyc-neutral-700">
            Source Documents
          </span>
        </div>

        <ul className="divide-y divide-kyc-neutral-100">
          {sourceDocuments.map((doc) => (
            <li
              key={doc.name}
              className={`px-4 py-3 flex items-center gap-3 group ${
                doc.available ? "hover:bg-kyc-neutral-50" : "opacity-50"
              } transition-colors`}
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  doc.available
                    ? "bg-kyc-blue-light border border-kyc-blue-mid/40"
                    : "bg-kyc-neutral-100 border border-kyc-neutral-200"
                }`}
              >
                <FileText
                  size={14}
                  className={doc.available ? "text-kyc-blue" : "text-kyc-neutral-600"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-kyc-neutral-800 truncate">
                  {doc.name}
                </div>
                <div className="text-xs text-kyc-neutral-600">{doc.page}</div>
              </div>
              {doc.available ? (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 flex items-center justify-center text-kyc-neutral-600 hover:text-kyc-blue rounded hover:bg-kyc-blue-light">
                    <ExternalLink size={12} />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center text-kyc-neutral-600 hover:text-kyc-blue rounded hover:bg-kyc-blue-light">
                    <Download size={12} />
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  Missing
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="px-4 py-3 border-t border-kyc-neutral-200">
          <button className="text-xs font-medium text-kyc-blue hover:underline flex items-center gap-1">
            <ExternalLink size={11} />
            View all documents
          </button>
        </div>
      </div>

      {/* Case Activity */}
      <div className="bg-white rounded-md border border-kyc-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-kyc-neutral-200 bg-kyc-neutral-50">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-kyc-neutral-700">
            Recent Activity
          </span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { actor: "Alex Kim", action: "opened case", time: "2h ago" },
            { actor: "AI Agent", action: "completed entity analysis", time: "2h ago" },
            { actor: "Sarah M.", action: "uploaded Form ADV", time: "1d ago" },
          ].map((event, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-kyc-blue-mid mt-1.5 shrink-0" />
              <div className="text-xs text-kyc-neutral-600 leading-relaxed">
                <span className="font-semibold text-kyc-neutral-800">{event.actor}</span>{" "}
                {event.action}
                <span className="text-kyc-neutral-600 ml-1.5">{event.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
