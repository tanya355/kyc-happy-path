import { useEffect, useRef } from "react";
import { X, Building2, Globe, Users, Calendar, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

interface NewsItem {
  headline: string;
  source: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  url: string;
  summary: string;
}

const newsItems: NewsItem[] = [
  {
    headline: "BlackRock Reports Record AUM of $10.5 Trillion in Q4 2024",
    source: "Financial Times",
    date: "Jan 14, 2025",
    sentiment: "positive",
    url: "https://www.ft.com",
    summary: "BlackRock's assets under management hit a record $10.5 trillion, driven by strong inflows into ETFs and active fixed income strategies.",
  },
  {
    headline: "BlackRock Expands Private Credit Platform with $12B Fundraise",
    source: "Wall Street Journal",
    date: "Dec 9, 2024",
    sentiment: "positive",
    url: "https://www.wsj.com",
    summary: "The firm closed its largest-ever private credit fund, underscoring growing institutional demand for alternative credit strategies.",
  },
  {
    headline: "SEC Investigates BlackRock ESG Disclosure Practices",
    source: "Reuters",
    date: "Nov 22, 2024",
    sentiment: "negative",
    url: "https://www.reuters.com",
    summary: "Regulators are scrutinising whether BlackRock's ESG fund disclosures accurately reflect underlying portfolio holdings.",
  },
  {
    headline: "BlackRock and Microsoft Partner on $30B AI Infrastructure Initiative",
    source: "Bloomberg",
    date: "Oct 3, 2024",
    sentiment: "positive",
    url: "https://www.bloomberg.com",
    summary: "The partnership aims to fund data centres and energy infrastructure to support the rapid growth of AI workloads globally.",
  },
  {
    headline: "BlackRock CEO Larry Fink Signals Shift on Climate Commitments",
    source: "The Guardian",
    date: "Sep 18, 2024",
    sentiment: "neutral",
    url: "https://www.theguardian.com",
    summary: "Fink's annual letter to CEOs struck a more cautious tone on net-zero pledges, citing political headwinds and client demand diversity.",
  },
];

const SENTIMENT_META: Record<NewsItem["sentiment"], { icon: React.ReactNode; label: string; className: string }> = {
  positive: {
    icon: <TrendingUp size={11} aria-hidden="true" />,
    label: "Positive",
    className: "bg-ds-green-000 text-ds-green-700 border-ds-green-100",
  },
  negative: {
    icon: <TrendingDown size={11} aria-hidden="true" />,
    label: "Negative",
    className: "bg-ds-red-000 text-ds-red-700 border-ds-red-200",
  },
  neutral: {
    icon: <Minus size={11} aria-hidden="true" />,
    label: "Neutral",
    className: "bg-ds-neutral-100 text-ds-neutral-700 border-ds-neutral-200",
  },
};

interface DrgModalProps {
  onClose: () => void;
}

export function DrgModal({ onClose }: DrgModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on mount; restore on unmount
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,16,48,0.5)" }}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drg-modal-title"
        style={{
          background: "var(--color-base-white)",
          border: "1px solid var(--color-neutral-200)",
          boxShadow: "var(--shadow-dialog, 0 8px 32px rgba(0,0,0,0.14))",
        }}
      >
        {/* DS top accent */}
        <div style={{ height: 3, background: "var(--color-dark-blue-600)", flexShrink: 0 }} aria-hidden="true" />

        {/* Header */}
        <div
          className="shrink-0 flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-ds-neutral-500 mb-0.5">
              Designated Reference Group
            </p>
            <h2
              id="drg-modal-title"
              className="text-[16px] font-bold text-ds-neutral-900 leading-tight"
            >
              BlackRock DRG Group
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close DRG details"
            className="w-8 h-8 flex items-center justify-center rounded text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600 shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Overview */}
          <section className="px-6 py-5 border-b" style={{ borderColor: "var(--color-neutral-200)" }} aria-labelledby="drg-overview-heading">
            <h3 id="drg-overview-heading" className="text-[10px] font-bold uppercase tracking-widest text-ds-neutral-500 mb-3">
              Overview
            </h3>
            <p className="text-[13px] text-ds-neutral-700 leading-relaxed mb-4">
              BlackRock DRG Group encompasses BlackRock's primary affiliated entities under KYC review. BlackRock, Inc. is the world's largest asset manager, with over $10.5 trillion in AUM, operating across investment management, risk advisory, and financial technology through its Aladdin platform.
            </p>

            {/* Metadata tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { icon: <Building2 size={12} aria-hidden="true" />, label: "Industry", value: "Asset Management" },
                { icon: <Globe size={12} aria-hidden="true" />,     label: "Region",   value: "Global — HQ New York" },
                { icon: <Users size={12} aria-hidden="true" />,     label: "Entities", value: "12 entities" },
                { icon: <Calendar size={12} aria-hidden="true" />,  label: "Client Since", value: "2013" },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-lg px-3 py-2.5"
                  style={{ background: "var(--color-neutral-050, #fafafa)", border: "1px solid var(--color-neutral-200)" }}
                >
                  <div className="flex items-center gap-1.5 text-ds-neutral-600 mb-1">
                    {icon}
                    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-ds-neutral-800">{value}</p>
                </div>
              ))}
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Risk Rating",      value: "Elevated", style: { color: "var(--color-yellow-700)", borderColor: "var(--color-yellow-200)" } },
                { label: "AUM",              value: "$10.5T",   style: { color: "var(--color-neutral-900)", borderColor: "var(--color-neutral-200)" } },
                { label: "Review Priority",  value: "High",     style: { color: "var(--color-red-700)",    borderColor: "var(--color-red-200)" } },
              ].map(({ label, value, style }) => (
                <div
                  key={label}
                  className="rounded-lg px-3 py-2.5"
                  style={{ background: "var(--color-base-white)", border: `1px solid ${style.borderColor}` }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ds-neutral-500 mb-0.5">{label}</p>
                  <p className="text-[15px] font-bold" style={{ color: style.color }}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Latest News */}
          <section className="px-6 py-5" aria-labelledby="drg-news-heading">
            <h3 id="drg-news-heading" className="text-[10px] font-bold uppercase tracking-widest text-ds-neutral-500 mb-3">
              Latest News
            </h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {newsItems.map((item) => {
                const meta = SENTIMENT_META[item.sentiment];
                return (
                  <li
                    key={item.headline}
                    className="rounded-lg p-3.5"
                    style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}
                  >
                    {/* Headline + link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1.5 group mb-1.5 focus-visible:outline-2 focus-visible:outline-ds-dark-blue-600 rounded"
                      aria-label={`${item.headline} — opens in a new tab`}
                    >
                      <span
                        className="text-[13px] font-semibold leading-snug flex-1 text-ds-neutral-900 group-hover:text-ds-dark-blue-600 transition-colors"
                      >
                        {item.headline}
                      </span>
                      <ExternalLink size={11} className="shrink-0 mt-0.5 text-ds-neutral-400 group-hover:text-ds-dark-blue-600 transition-colors" aria-hidden="true" />
                    </a>

                    {/* Summary */}
                    <p className="text-[11px] text-ds-neutral-600 leading-relaxed mb-2.5">
                      {item.summary}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-medium text-ds-neutral-700">{item.source}</span>
                      <span className="text-ds-neutral-300" aria-hidden="true">·</span>
                      <time className="text-[10px] text-ds-neutral-500" dateTime={item.date}>{item.date}</time>
                      <span
                        className={`ml-auto inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 ${meta.className}`}
                        aria-label={`Sentiment: ${meta.label}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-3 border-t"
          style={{ borderColor: "var(--color-neutral-200)", background: "var(--color-neutral-000)" }}
        >
          <span className="text-[10px] text-ds-neutral-500">
            Source: KPMG KYC Records · Updated May 2026
          </span>
          <Button variant="outlined" size="small" label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
