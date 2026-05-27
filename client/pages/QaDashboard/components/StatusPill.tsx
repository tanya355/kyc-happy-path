import { STATUS_CONFIG, type StatusValue } from "../QaDashboardData";

interface StatusPillProps {
  status: StatusValue;
  size?: "xs" | "sm";
}

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status];
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";
  const dotSize  = size === "xs" ? "w-1 h-1"   : "w-1.5 h-1.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${textSize}`}
      style={{
        background: cfg.bg,
        border: `1px dashed ${cfg.border}`,
        color: cfg.text,
        padding: size === "xs" ? "1px 6px" : "2px 8px",
      }}
      title="Status taxonomy is a placeholder — final values TBD"
    >
      <span className={`rounded-full shrink-0 ${dotSize}`} style={{ background: cfg.dot }} aria-hidden />
      {cfg.label}
    </span>
  );
}
