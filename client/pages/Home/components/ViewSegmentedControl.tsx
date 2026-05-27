import type { HomeViewKey, HomeViewOption } from "../HomeData";

interface ViewSegmentedControlProps {
  options: readonly HomeViewOption[];
  value: HomeViewKey;
  onChange: (next: HomeViewKey) => void;
}

export function ViewSegmentedControl({ options, value, onChange }: ViewSegmentedControlProps) {
  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-full"
      style={{ background: "var(--color-neutral-100)" }}
      role="group"
      aria-label="View filter"
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            className="px-3 py-1 text-[10px] font-semibold rounded-full transition-all"
            style={
              active
                ? {
                    background: "var(--color-base-white)",
                    color: "var(--color-dark-blue-600)",
                    boxShadow: "var(--shadow-100)",
                  }
                : { color: "var(--color-neutral-600)" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
