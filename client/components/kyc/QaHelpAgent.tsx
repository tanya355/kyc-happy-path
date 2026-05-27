/**
 * QaHelpAgent — KPMG KYC AI Knowledge Assistant
 *
 * UI-only / static preview experience.
 * Real-time Forge integration is NOT yet wired — responses are
 * simulated from a local knowledge base.
 *
 * Sources: KPMG KYC Policy Manual v4.2, FATF Recommendations,
 *          FinCEN/FCA guidance.
 */

import { useState, useRef, useEffect, useId } from "react";
import {
  BookOpen, Send, RotateCcw, X,
  Scale, FileSearch, ShieldCheck,
  AlertTriangle, Globe, FileText,
  Building2, Landmark, Zap, FlaskConical,
} from "lucide-react";
import { Button } from "@kpmg-us/ad-design-lib";

/* ── Types ── */
interface Message {
  role: "user" | "agent";
  text: string;
  timestamp: string;
  sources?: { label: string; section: string }[];
  followUps?: string[];
}

/* ── Knowledge base ── */
const KB: Record<string, { text: string; sources: { label: string; section: string }[]; followUps: string[] }> = {
  "ubo threshold rules": {
    text: "Under FATF Recommendation 24 and most jurisdictions, a beneficial owner (UBO) is any natural person who owns or controls ≥25% of shares or voting rights, or exercises control by other means.\n\n• High-risk entities: FinCEN and FCA apply a lower 10% threshold\n• KPMG CDD policy defaults to 25% but flags any ≥10% holder for EDD\n• Indirect ownership chains: apply thresholds at each level and aggregate\n• Nominee arrangements: always look through to the underlying beneficial owner\n\nIf no natural person meets the threshold, the senior managing official must be identified.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§3.2 Beneficial Ownership" }, { label: "FATF Recommendation 24", section: "R.24 Transparency" }],
    followUps: ["How do I verify UBO identity documents?", "When does indirect ownership trigger EDD?", "What if the entity has no natural person UBO?"],
  },
  "pep screening": {
    text: "PEP (Politically Exposed Person) screening must cover:\n• Entity directors, senior officers, and beneficial owners\n• Immediate family members and known close associates\n• Both foreign and domestic PEPs (jurisdiction-dependent)\n\nProcedure:\n1. Screen at onboarding against Refinitiv World-Check and Dow Jones Risk\n2. Assess role, jurisdiction, and tenure — higher risk = entrenched officials\n3. Apply EDD for all confirmed PEPs: source of wealth, source of funds\n4. Re-screen at every periodic review and on trigger events\n\nFormer PEPs remain subject to EDD for ≥12 months post-exit from public function. All PEP decisions must be approved by a second-level reviewer.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§5.1 PEP Identification" }, { label: "FATF Recommendation 12", section: "R.12 PEPs" }],
    followUps: ["What qualifies as a domestic PEP?", "How do I assess PEP risk level?", "What EDD is required for PEPs?"],
  },
  "adverse media": {
    text: "Adverse media (negative news) includes credible published reporting linking a subject to:\n\n• Financial crime: fraud, money laundering, bribery, corruption\n• Sanctions or regulatory enforcement actions\n• Terrorism or proliferation financing\n• Human rights violations or organized crime links\n\nNot all negative press qualifies for EDD:\n✓ Trigger EDD: Convictions, regulatory fines, confirmed sanctions matches\n✗ Generally don't trigger: Unverified allegations, civil disputes, minor regulatory breaches\n\nSource credibility assessment is required — use Dow Jones Factiva or LexisNexis. Document your rationale and assess recency. For ongoing clients, adverse media alerts require review within 2 business days.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§6.3 Adverse Media Screening" }, { label: "FATF Guidance", section: "Risk-Based Approach 2023" }],
    followUps: ["How do I assess adverse media source credibility?", "When does adverse media trigger re-screening?", "What is the adverse media escalation threshold?"],
  },
  "escalate vs rework": {
    text: "Rework when:\n• The analyst decision is correctable with additional documentation\n• A minor exception can be resolved without senior sign-off\n• The client response is pending and the case can wait\n• AI and analyst agree on the risk level but documentation is incomplete\n\nEscalate when:\n• The case presents novel or unresolved compliance risk\n• A confirmed PEP or sanctions match cannot be cleared\n• Material disagreement between AI and analyst determination\n• High Risk rating + UBO gap detected\n• Client is unresponsive beyond SLA threshold\n• Any regulatory red flag requiring senior approval\n\nDocument your escalation rationale in the case notes. When in doubt, escalate — it is never wrong to seek senior guidance.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§8.4 Decision Escalation" }, { label: "QA Review Procedures", section: "§2.1 Reviewer Accountability" }],
    followUps: ["What is the SLA for escalated cases?", "Who receives escalation notifications?", "How do I document an escalation decision?"],
  },
  "sanctions screening": {
    text: "Sanctions screening is mandatory at:\n• Client onboarding\n• Annual periodic review\n• Any material change in ownership or control\n• On receipt of an automated alert from screening tools\n\nScreening must cover:\n1. OFAC SDN and Consolidated Sanctions Lists\n2. EU Consolidated List and UK Financial Sanctions\n3. UN Security Council Consolidated List\n4. Jurisdiction-specific lists (HKMA, MAS, etc.)\n\nMatch handling:\n• True match → immediate account freeze, notify Compliance\n• Potential match → escalate within 4 hours for senior review\n• False positive → document rationale and clear with approval\n\nAll sanctions-related decisions must be reviewed by the Sanctions Team before any client communication.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§4.2 Sanctions Compliance" }, { label: "OFAC Guidance", section: "SDN List 2024" }],
    followUps: ["How do I handle a potential sanctions match?", "What is the false positive documentation requirement?", "Who authorizes a sanctions false positive clearance?"],
  },
  "source of funds": {
    text: "Source of Funds (SOF) verification establishes the origin of the specific funds used in the business relationship.\n\nRequired for:\n• All High-Risk clients\n• PEPs and their associates\n• Clients in high-risk jurisdictions\n• Transactions above KPMG's EDD threshold\n\nAcceptable SOF evidence:\n✓ Bank statements (last 3–6 months)\n✓ Audited financial statements\n✓ Property sale documentation\n✓ Investment account statements\n✓ Inheritance documentation\n\nNote: SOF ≠ Source of Wealth (SOW). SOF covers the specific transaction; SOW covers how the client accumulated their overall net worth. EDD typically requires both.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§5.3 Source of Funds & Wealth" }, { label: "FATF Guidance", section: "EDD Requirements" }],
    followUps: ["What is the difference between SOF and SOW?", "How many months of bank statements are required?", "When is SOF re-verification required?"],
  },
  "risk rating methodology": {
    text: "KPMG's client risk rating model scores across four dimensions:\n\n1. Client Type — Individual, Corporate, Trust, PEP, Nonprofit (0–30 pts)\n2. Geography — Jurisdiction risk based on FATF grey/black lists (0–25 pts)\n3. Products & Services — Complexity and transparency of services (0–25 pts)\n4. Delivery Channel — Face-to-face vs. non-face-to-face onboarding (0–20 pts)\n\nRisk Tiers:\n• Low: 0–40 | Simplified Due Diligence, 3-year review cycle\n• Medium: 41–70 | Standard CDD, 2-year review cycle\n• High: 71–100 | Enhanced Due Diligence, annual review cycle\n\nRisk ratings can be overridden upward by the reviewing analyst with documented rationale. Downward overrides require senior manager approval.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§3.1 Risk Rating Model" }, { label: "CDD Procedures", section: "§1.4 Risk Scoring" }],
    followUps: ["How do I override a client risk rating?", "What triggers a risk rating upgrade mid-cycle?", "Which jurisdictions are FATF-listed?"],
  },
  "cdd vs edd": {
    text: "Customer Due Diligence (CDD) is the baseline KYC process. Enhanced Due Diligence (EDD) applies additional scrutiny to higher-risk relationships.\n\nCDD covers:\n• Identity verification (ID documents + address)\n• Beneficial ownership mapping\n• Nature and purpose of business relationship\n• Source of funds (basic)\n\nEDD additionally requires:\n• Source of Wealth documentation\n• Enhanced adverse media screening\n• In-depth ownership chain analysis\n• Senior management approval\n• More frequent transaction monitoring\n• Documented rationale for maintaining the relationship\n\nEDD is mandatory for: PEPs, High-Risk clients, high-risk jurisdiction clients, and any client with unresolved adverse media.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "§5.0 CDD & EDD Framework" }, { label: "FATF Recommendation 10", section: "R.10 Customer Due Diligence" }],
    followUps: ["What triggers mandatory EDD?", "Who can approve an EDD relationship?", "How long must EDD records be retained?"],
  },
};

/* ── QA-dashboard pre-seeded conversation ── */
const QA_SEED_MESSAGES: Message[] = [
  {
    role: "user",
    text: "I'm reviewing the BlackRock Advisors LLC EDD case. What should I focus on?",
    timestamp: "09:14 AM",
  },
  {
    role: "agent",
    text: "For an EDD review of a large asset manager like BlackRock Advisors LLC, prioritise these four areas:\n\n1. UBO & Ownership Chain — Confirm all beneficial owners ≥25% are mapped and verified. For institutional asset managers, look through fund structures to identify natural persons.\n\n2. PEP Exposure — Senior executives (e.g. CEO/Chairman) of major financial institutions may qualify as domestic PEPs under FATF R.12. Verify screening against Refinitiv World-Check is current.\n\n3. Source of Funds evidence — AUM verification must reference an authoritative external source (SEC Form ADV or audited Annual Report). Analyst notes alone don't satisfy CDD evidence standards.\n\n4. Document currency — Check ID document expiry dates for all principals. An expired passport requires a formal exception or updated document before the case can close.\n\nWould you like detail on any of these areas?",
    timestamp: "09:14 AM",
    sources: [
      { label: "KPMG KYC Policy Manual", section: "§5.0 CDD & EDD Framework" },
      { label: "FATF Recommendation 12", section: "R.12 PEPs" },
    ],
    followUps: [
      "What EDD documentation is required for PEPs?",
      "How do I handle an expired passport exception?",
      "What is an authoritative source for AUM verification?",
    ],
  },
];

function getTimestamp() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const QA_GREETING: Message = {
  role: "agent",
  text: "Hi Quinn — I can see you're reviewing the BlackRock Advisors LLC EDD case.\n\nI've summarised the key areas to focus on below. Ask me anything about KYC policy, evidence standards, or escalation procedures.",
  timestamp: getTimestamp(),
  sources: [{ label: "KPMG KYC Policy Manual", section: "v4.2" }],
};

const QUICK_TOPICS = [
  { icon: <Scale size={11} aria-hidden="true" />,         label: "UBO threshold rules", key: "ubo threshold rules" },
  { icon: <ShieldCheck size={11} aria-hidden="true" />,   label: "PEP screening",       key: "pep screening" },
  { icon: <FileSearch size={11} aria-hidden="true" />,    label: "Adverse media",       key: "adverse media" },
  { icon: <AlertTriangle size={11} aria-hidden="true" />, label: "Escalate vs rework",  key: "escalate vs rework" },
  { icon: <Globe size={11} aria-hidden="true" />,         label: "Sanctions",           key: "sanctions screening" },
  { icon: <FileText size={11} aria-hidden="true" />,      label: "Source of funds",     key: "source of funds" },
  { icon: <Building2 size={11} aria-hidden="true" />,     label: "Risk rating",         key: "risk rating methodology" },
  { icon: <Landmark size={11} aria-hidden="true" />,      label: "CDD vs EDD",          key: "cdd vs edd" },
];

function findResponse(input: string) {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(KB)) {
    const words = key.split(" ");
    if (words.some(w => lower.includes(w)) || lower.includes(key)) return val;
  }
  return {
    text: "That's a nuanced compliance question. Based on KPMG KYC Policy Manual v4.2, I recommend consulting your Compliance Advisory team for precise guidance on this topic.\n\nIf this relates to a specific case attribute, flag it via the Escalate workflow for senior review.",
    sources: [{ label: "KPMG KYC Policy Manual", section: "v4.2 General Guidance" }],
    followUps: ["What is the escalation procedure?", "How do I contact the Compliance Advisory team?"],
  };
}

/* ── Component ── */
export function QaHelpAgent() {
  const dialogId  = useId();
  const descId    = useId();
  const statusId  = useId();

  const [pathname, setPathname] = useState(window.location.pathname);
  const isQaDashboard = pathname === "/qa-dashboard";

  /* Track route changes without a Router context */
  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onNav);
    const origPush    = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState    = (...args) => { origPush(...args);    onNav(); };
    history.replaceState = (...args) => { origReplace(...args); onNav(); };
    return () => {
      window.removeEventListener("popstate", onNav);
      history.pushState    = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  const defaultMessages = (): Message[] =>
    isQaDashboard
      ? [{ ...QA_GREETING, timestamp: getTimestamp() }, ...QA_SEED_MESSAGES]
      : [{
          role: "agent",
          text: "Hi — I'm your KPMG KYC AI Assistant, grounded in KPMG's KYC Policy Manual v4.2 and current regulatory guidance.\n\nAsk me about UBO rules, PEP screening, sanctions, risk ratings, or any KYC compliance procedure.",
          timestamp: getTimestamp(),
          sources: [{ label: "KPMG KYC Policy Manual", section: "v4.2" }],
        }];

  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [thinking, setThinking] = useState(false);
  const [streamIdx, setStreamIdx] = useState<number | null>(null);
  const [streamText, setStreamText] = useState("");
  const [statusMsg, setStatusMsg]   = useState("");

  const inputRef  = useRef<HTMLInputElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);


  /* Toggle via top-nav custom event */
  useEffect(() => {
    const handler = () => setOpen(v => !v);
    window.addEventListener("kyc-chat-toggle", handler);
    return () => window.removeEventListener("kyc-chat-toggle", handler);
  }, []);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Escape key closes the panel */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Scroll to bottom on new content */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, streamText]);

  const streamIn = (fullText: string, onDone: () => void) => {
    let i = 0;
    setStreamText("");
    const interval = setInterval(() => {
      i += 4;
      setStreamText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setStreamText(fullText);
        onDone();
      }
    }, 12);
  };

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { role: "user", text: text.trim(), timestamp: getTimestamp() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setStatusMsg("AI is searching the knowledge base…");
    setTimeout(() => {
      const resp = findResponse(text);
      setThinking(false);
      setStatusMsg("AI response received");
      const idx = messages.length + 1;
      setStreamIdx(idx);
      streamIn(resp.text, () => {
        setStreamIdx(null);
        setStreamText("");
        setStatusMsg("");
        setMessages(prev => [...prev, {
          role: "agent",
          text: resp.text,
          timestamp: getTimestamp(),
          sources: resp.sources,
          followUps: resp.followUps,
        }]);
      });
    }, 700 + Math.random() * 400);
  };

  const reset = () => {
    setMessages(defaultMessages());
    setInput("");
    setStreamIdx(null);
    setStreamText("");
    setStatusMsg("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const close = () => setOpen(false);

  if (!open) return null;

  /* DS token shorthand */
  const tok = {
    blue600:    "var(--color-dark-blue-600)",
    blue300:    "var(--color-dark-blue-300)",
    blue100:    "var(--color-dark-blue-100)",
    blue000:    "var(--color-dark-blue-000)",
    neu900:     "var(--color-neutral-900)",
    neu700:     "var(--color-neutral-700)",
    neu600:     "var(--color-neutral-600)",
    neu300:     "var(--color-neutral-300)",
    neu200:     "var(--color-neutral-200)",
    neu100:     "var(--color-neutral-100)",
    neu050:     "var(--color-neutral-050, #fafafa)",
    neu000:     "var(--color-neutral-000)",
    white:      "var(--color-base-white)",
    corner100:  "var(--corner-100)",
    corner200:  "var(--corner-200)",
    shadow300:  "var(--shadow-300)",
  };

  return (
    <div
      ref={panelRef}
      id={dialogId}
      role="dialog"
      aria-label="KYC AI Assistant"
      aria-describedby={descId}
      aria-modal="false"
      className="fixed z-[200] flex flex-col overflow-hidden"
      style={{
        top: 58,
        right: 0,
        width: 380,
        height: "calc(100vh - 58px)",
        background: tok.white,
        borderLeft: `1px solid ${tok.neu200}`,
        boxShadow: tok.shadow300,
        animation: "slideInRight 200ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Hidden description for screen readers */}
      <p id={descId} className="sr-only">
        KPMG KYC AI Assistant — static preview powered by the KYC Policy Manual v4.2.
        Ask questions about UBO rules, PEP screening, sanctions, or any KYC compliance procedure.
        Press Escape to close.
      </p>

      {/* Live region for dynamic status announcements */}
      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMsg}
      </div>

      {/* ── Top accent bar ── */}
      <div style={{ height: 3, background: tok.blue600, flexShrink: 0 }} aria-hidden="true" />

      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ background: tok.blue000, borderBottom: `1px solid ${tok.blue100}` }}
      >
        {/* Agent avatar */}
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ background: tok.blue600, borderRadius: tok.corner100 }}
          aria-hidden="true"
        >
          <Zap size={14} color="white" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold leading-none" style={{ color: tok.neu900 }}>
            KYC AI Assistant
          </p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: tok.neu700 }}>
            KYC Policy Manual v4.2 · FATF · FinCEN · FCA
          </p>
        </div>

        {/* Preview badge */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold shrink-0"
          style={{
            background: "var(--color-yellow-000, #fffbeb)",
            color: "var(--color-yellow-800, #92400e)",
            border: "1px solid var(--color-yellow-300, #fcd34d)",
            borderRadius: tok.corner100,
          }}
          title="Responses are simulated from a local knowledge base. Real-time integration is not yet enabled."
        >
          <FlaskConical size={9} aria-hidden="true" />
          Preview
        </span>

        {/* Reset */}
        <button
          ref={closeRef}
          onClick={reset}
          aria-label="Clear chat history and start a new session"
          className="w-8 h-8 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderRadius: tok.corner100,
            color: tok.neu700,
            outlineColor: tok.blue600,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = tok.neu100; e.currentTarget.style.color = tok.blue600; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tok.neu700; }}
        >
          <RotateCcw size={13} aria-hidden="true" />
        </button>

        {/* Close */}
        <button
          onClick={close}
          aria-label="Close AI Assistant"
          className="w-8 h-8 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderRadius: tok.corner100,
            color: tok.neu700,
            outlineColor: tok.blue600,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = tok.neu100; e.currentTarget.style.color = tok.blue600; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tok.neu700; }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {/* ── Quick topic chips ── */}
      <div
        className="shrink-0 flex flex-wrap gap-1.5 px-4 pt-3 pb-2.5"
        style={{ borderBottom: `1px solid ${tok.neu200}` }}
        role="group"
        aria-label="Quick topic shortcuts"
      >
        <p className="w-full text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: tok.neu600 }}>
          Quick topics
        </p>
        {QUICK_TOPICS.map(t => (
          <button
            key={t.key}
            onClick={() => send(t.label)}
            aria-label={`Ask about ${t.label}`}
            disabled={thinking}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
            style={{
              background: tok.neu000,
              border: `1px solid ${tok.neu300}`,
              borderRadius: "var(--corner-full, 9999px)",
              color: tok.neu700,
              outlineColor: tok.blue600,
            }}
            onMouseEnter={e => { if (!thinking) { e.currentTarget.style.background = tok.blue000; e.currentTarget.style.borderColor = tok.blue300; e.currentTarget.style.color = tok.blue600; } }}
            onMouseLeave={e => { e.currentTarget.style.background = tok.neu000; e.currentTarget.style.borderColor = tok.neu300; e.currentTarget.style.color = tok.neu700; }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>

            {/* Agent label row */}
            {m.role === "agent" && (
              <div className="flex items-center gap-1.5 mb-0.5" aria-hidden="true">
                <div
                  className="w-4 h-4 flex items-center justify-center"
                  style={{ background: tok.blue600, borderRadius: tok.corner100 }}
                >
                  <Zap size={8} color="white" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold" style={{ color: tok.blue600 }}>KYC AI</span>
                <span className="text-[11px]" style={{ color: tok.neu600 }}>{m.timestamp}</span>
              </div>
            )}

            {/* Bubble */}
            <div
              className="px-3 py-2.5 max-w-[92%]"
              style={{
                fontSize: 12,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                borderRadius: tok.corner200,
                background: m.role === "user" ? tok.blue600 : tok.neu050,
                color: m.role === "user" ? tok.white : tok.neu900,
                border: m.role === "agent" ? `1px solid ${tok.neu200}` : "none",
              }}
            >
              {m.text}
            </div>

            {/* User timestamp (visible label) */}
            {m.role === "user" && (
              <span className="text-[11px] mt-0.5" style={{ color: tok.neu600 }}>
                <span className="sr-only">Sent at </span>{m.timestamp}
              </span>
            )}

            {/* Source citations */}
            {m.role === "agent" && m.sources && m.sources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5" aria-label="Sources cited">
                {m.sources.map((s, si) => (
                  <span
                    key={si}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-medium"
                    style={{
                      background: tok.blue000,
                      color: tok.blue600,
                      border: `1px solid ${tok.blue100}`,
                      borderRadius: "var(--corner-full, 9999px)",
                    }}
                  >
                    <BookOpen size={8} aria-hidden="true" />
                    {s.label} — {s.section}
                  </span>
                ))}
              </div>
            )}

            {/* Follow-up suggestions */}
            {m.role === "agent" && m.followUps && m.followUps.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 w-full max-w-[92%]">
                <span className="text-[11px]" style={{ color: tok.neu700 }}>Suggested follow-ups:</span>
                {m.followUps.map((f, fi) => (
                  <button
                    key={fi}
                    onClick={() => send(f)}
                    aria-label={`Ask: ${f}`}
                    disabled={thinking}
                    className="text-left px-3 py-1.5 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                    style={{
                      borderRadius: tok.corner100,
                      border: `1px solid ${tok.blue100}`,
                      color: tok.blue600,
                      background: tok.white,
                      outlineColor: tok.blue600,
                    }}
                    onMouseEnter={e => { if (!thinking) e.currentTarget.style.background = tok.blue000; }}
                    onMouseLeave={e => { e.currentTarget.style.background = tok.white; }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator — announced via status region */}
        {thinking && (
          <div className="flex flex-col items-start gap-1" aria-hidden="true">
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 flex items-center justify-center"
                style={{ background: tok.blue600, borderRadius: tok.corner100 }}
              >
                <Zap size={8} color="white" />
              </div>
              <span className="text-[11px] font-bold" style={{ color: tok.blue600 }}>KYC AI</span>
              <span className="text-[11px]" style={{ color: tok.neu600 }}>Searching knowledge base…</span>
            </div>
            <div
              className="px-3 py-2.5 flex items-center gap-1.5"
              style={{ background: tok.neu050, border: `1px solid ${tok.neu200}`, borderRadius: tok.corner200 }}
            >
              {[0, 1, 2].map(j => (
                <span
                  key={j}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: tok.blue300,
                    animation: `pulse 1.2s ease-in-out ${j * 0.22}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Streaming response */}
        {streamIdx !== null && streamText && (
          <div className="flex flex-col items-start gap-1" aria-hidden="true">
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 flex items-center justify-center"
                style={{ background: tok.blue600, borderRadius: tok.corner100 }}
              >
                <Zap size={8} color="white" />
              </div>
              <span className="text-[11px] font-bold" style={{ color: tok.blue600 }}>KYC AI</span>
            </div>
            <div
              className="px-3 py-2.5 max-w-[92%]"
              style={{
                fontSize: 12,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                background: tok.neu050,
                color: tok.neu900,
                border: `1px solid ${tok.neu200}`,
                borderRadius: tok.corner200,
              }}
            >
              {streamText}
              <span
                className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse"
                style={{ background: tok.blue600 }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-3"
        style={{ borderTop: `1px solid ${tok.neu200}`, background: tok.white }}
      >
        <label htmlFor="qa-agent-input" className="sr-only">
          Ask the KYC AI Assistant a question
        </label>
        <input
          id="qa-agent-input"
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          placeholder="Ask about KYC policy, AML, sanctions…"
          aria-label="Ask the AI assistant a question"
          disabled={thinking}
          className="flex-1 bg-transparent outline-none disabled:opacity-60"
          style={{
            fontSize: 12,
            color: tok.neu900,
          }}
        />
        <Button
          variant="filled"
          size="small"
          label="Send"
          showIconTrailing
          icon={<Send size={11} aria-hidden="true" />}
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
        />
      </div>

      {/* ── Footer ── */}
      <div
        className="shrink-0 px-4 py-2 flex items-center justify-between"
        style={{ borderTop: `1px solid ${tok.neu100}`, background: tok.neu000 }}
      >
        <span className="text-[10px]" style={{ color: tok.neu600 }}>
          Static preview — agent integration pending
        </span>
        <span className="text-[10px] font-semibold" style={{ color: tok.neu700 }}>
          Internal use only
        </span>
      </div>
    </div>
  );
}
