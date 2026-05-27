import { useEffect, useState } from "react";

type AgentStatusTickerProps = {
  statuses: readonly string[];
  intervalMs?: number;
};

export function AgentStatusTicker({
  statuses,
  intervalMs = 3500,
}: AgentStatusTickerProps) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % statuses.length);
        setVisible(true);
      }, 400);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [statuses.length, intervalMs]);

  return (
    <span
      className="text-[10px] text-ds-dark-blue-600 italic transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {statuses[idx]}
    </span>
  );
}
