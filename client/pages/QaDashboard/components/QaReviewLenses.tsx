import { useState, type ReactNode } from "react";
import {
  Sparkles, ChevronDown, Bot, Loader2, RefreshCw,
  Flag, Shield, Users2, Briefcase, TrendingDown,
} from "lucide-react";
import {
  REVIEW_LENSES,
  type LensIconToken,
} from "../QaDashboardData";

const LENS_ICONS: Record<LensIconToken, ReactNode> = {
  "flag":          <Flag size={13} />,
  "shield":        <Shield size={13} />,
  "users":         <Users2 size={13} />,
  "briefcase":     <Briefcase size={13} />,
  "trending-down": <TrendingDown size={13} />,
};

export { LENS_ICONS };

interface QaReviewLensesProps {
  lens: string;
  onChangeLens: (l: string) => void;
}

export function QaReviewLenses({ lens, onChangeLens }: QaReviewLensesProps) {
  const active = REVIEW_LENSES.find(l => l.id === lens) ?? REVIEW_LENSES[0];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setActiveQ]   = useState<string | null>(null);
  const [, setLoadingQ]  = useState<string | null>(null);
  const [, setAnsweredQ] = useState<string | null>(null);

  const handleChangeLens = (id: string) => {
    if (id === lens) return;
    setIsAnalyzing(true);
    setActiveQ(null);
    setAnsweredQ(null);
    setLoadingQ(null);
    onChangeLens(id);
    setTimeout(() => setIsAnalyzing(false), 1100);
  };

  const handleRefresh = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setActiveQ(null);
    setAnsweredQ(null);
    setLoadingQ(null);
    setTimeout(() => setIsAnalyzing(false), 1400);
  };

  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}>

      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={11} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
        <h3 className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>Review Lens</h3>
      </div>
      <p className="text-[10px] mb-2 leading-snug" style={{ color: "var(--color-neutral-700)" }}>
        Provides additional analytical perspectives — not a filter. Content remains the same; the AI assessment adapts to the selected lens.
      </p>

      <div className="relative mb-2.5">
        <label htmlFor="review-lens-select" className="sr-only">Review Lens</label>
        <select
          id="review-lens-select"
          value={lens}
          onChange={e => handleChangeLens(e.target.value)}
          aria-label="Select review lens"
          className="w-full appearance-none text-[12px] font-medium pl-3 pr-8 py-1.5 cursor-pointer transition-all focus-visible:outline-none"
          style={{
            background: "var(--color-base-white)",
            border: "1px solid var(--color-neutral-300)",
            borderRadius: "var(--corner-100)",
            color: "var(--color-neutral-900)",
          }}
          onFocus={e => { e.currentTarget.style.outline = "2px solid var(--color-dark-blue-600)"; e.currentTarget.style.outlineOffset = "2px"; }}
          onBlur={e => { e.currentTarget.style.outline = "none"; }}
        >
          {REVIEW_LENSES.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-neutral-500)" }} aria-hidden />
      </div>

      <div className="rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)", color: "var(--color-neutral-700)" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          {isAnalyzing
            ? <Loader2 size={10} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
            : <Bot size={10} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
          }
          <span className="text-[9px] font-bold uppercase tracking-widest flex-1" style={{ color: "var(--color-dark-blue-600)" }}>
            {isAnalyzing ? `Running ${active.label} agent…` : `AI Assessment · ${active.label}`}
          </span>
          {!isAnalyzing && (
            <button
              onClick={handleRefresh}
              aria-label="Refresh AI assessment"
              className="shrink-0 p-0.5 rounded transition-colors"
              style={{ color: "var(--color-dark-blue-400)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-dark-blue-600)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-dark-blue-400)")}
            >
              <RefreshCw size={10} aria-hidden />
            </button>
          )}
        </div>
        {isAnalyzing ? (
          <div className="space-y-1.5 animate-pulse">
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "90%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "100%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "75%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "85%" }} />
          </div>
        ) : (
          <p>{active.reasoning}</p>
        )}
      </div>

    </div>
  );
}
