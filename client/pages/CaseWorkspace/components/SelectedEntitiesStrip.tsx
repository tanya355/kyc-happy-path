import { X, ExternalLink } from "lucide-react";

export type SelectedEntitiesStripProps = {
  selectedEntities: string[];
  focusedEntity: string | null;
  entityCaseNumbers: Record<string, string>;
  onToggleFocus: (name: string) => void;
  onOpenEntityDetail: (name: string) => void;
  onRemoveEntity: (name: string) => void;
};

export function SelectedEntitiesStrip({
  selectedEntities,
  focusedEntity,
  entityCaseNumbers,
  onToggleFocus,
  onOpenEntityDetail,
  onRemoveEntity,
}: SelectedEntitiesStripProps) {
  return (
    <div className="shrink-0 px-6 py-3 flex items-center gap-3 border-b border-ds-neutral-200 bg-white z-10">
      <span className="text-[11px] font-semibold text-ds-neutral-600 shrink-0">
        Selected Entities
        <span className="ml-1.5 font-normal text-ds-neutral-500">({selectedEntities.length})</span>
      </span>

      <div className="w-px h-4 bg-ds-neutral-200 shrink-0" aria-hidden="true" />

      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {selectedEntities.map((name) => {
          const isFocused = focusedEntity === name;
          const isOther = focusedEntity !== null && !isFocused;
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
              <button
                onClick={() => onToggleFocus(name)}
                aria-pressed={isFocused}
                aria-label={isFocused ? `Unfocus ${name}` : `Focus ${name}`}
                className={`px-2.5 py-1 font-semibold leading-none transition-colors ${
                  isFocused ? "text-ds-dark-blue-600" : "text-ds-neutral-800 hover:text-ds-dark-blue-600"
                }`}
              >
                {name}
              </button>
              <span
                className="px-2 py-1 font-mono font-medium text-[11px] text-ds-dark-blue-600 leading-none border-l border-ds-neutral-200"
                style={{ background: "var(--color-dark-blue-000)" }}
              >
                {entityCaseNumbers[name] ?? "—"}
              </span>
              <button
                onClick={() => onOpenEntityDetail(name)}
                aria-label={`View detail for ${name}`}
                className="px-1.5 py-1 text-ds-neutral-400 hover:text-ds-dark-blue-600 hover:bg-ds-neutral-100 transition-colors border-l border-ds-neutral-200 leading-none"
                title="View entity detail"
              >
                <ExternalLink size={10} aria-hidden="true" />
              </button>
              <button
                onClick={() => onRemoveEntity(name)}
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
  );
}
