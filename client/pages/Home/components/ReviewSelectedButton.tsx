interface ReviewSelectedButtonProps {
  count: number;
  onClick: () => void;
}

export function ReviewSelectedButton({ count, onClick }: ReviewSelectedButtonProps) {
  const hasSelection = count > 0;

  return (
    <button
      onClick={() => hasSelection && onClick()}
      disabled={!hasSelection}
      className="inline-flex items-center gap-2 px-4 h-9 text-[12px] font-semibold text-white disabled:opacity-40 disabled:pointer-events-none transition-opacity shrink-0"
      style={{ background: "var(--color-dark-blue-600)", borderRadius: "var(--corner-full)" }}
    >
      Review Selected
      {hasSelection && (
        <span
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
