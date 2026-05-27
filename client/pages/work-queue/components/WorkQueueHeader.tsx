interface WorkQueueHeaderProps {
  title: string;
  subtitle: string;
}

export function WorkQueueHeader({ title, subtitle }: WorkQueueHeaderProps) {
  return (
    <div
      className="shrink-0 px-6 py-4 border-b flex items-center justify-between"
      style={{ borderColor: "var(--color-neutral-200)" }}
    >
      <div>
        <h1 className="text-[18px] font-bold text-neutral-800 leading-tight">{title}</h1>
        <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
