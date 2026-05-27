import type { ReactNode } from "react";

interface PlaceholderCardProps {
  icon: ReactNode;
  title: string;
  body: string;
  footer?: ReactNode;
}

export function PlaceholderCard({ icon, title, body, footer }: PlaceholderCardProps) {
  return (
    <div
      className="text-center max-w-sm rounded-2xl px-10 py-10"
      style={{
        background: "rgba(255,255,255,0.52)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(0,51,141,0.13)",
        boxShadow:
          "0 4px 32px rgba(0,51,141,0.07), inset 0 1px 0 rgba(255,255,255,0.75)",
      }}
    >
      <div className="w-16 h-16 rounded-full bg-kyc-blue-light border border-kyc-blue-mid/40 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-kyc-neutral-800 mb-2">{title}</h2>
      <p className="text-sm text-kyc-neutral-600 leading-relaxed">{body}</p>
      {footer && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-kyc-neutral-600">
          {footer}
        </div>
      )}
    </div>
  );
}
