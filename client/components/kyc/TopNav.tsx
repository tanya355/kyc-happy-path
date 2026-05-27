import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Zap, ChevronDown, Check, Play } from "lucide-react";
import { FloatingTopAppBar, Button } from "@kpmg-us/ad-design-lib";

const tabs = [
  { label: "Dashboard",       path: "/analyst-dashboard", match: ["/analyst-dashboard"]           },
  { label: "Work Queue",      path: "/dashboard",         match: ["/dashboard", "/case", "/qa-work-hub", "/qa-dashboard"] },
  { label: "Reports",         path: "/reports",           match: ["/reports"]                     },
];

const BANNER_AGENTS = [
  { id: "bulk-triage",     label: "Bulk Triage Selected Cases",   desc: "Best for high-risk DRG entities in queue" },
  { id: "agent-review",   label: "Agent Review",                  desc: "AI reviews analyst decisions across all exceptions" },
  { id: "doc-extraction",  label: "Document Extraction Agent",     desc: "Extract KYC fields from uploaded documents" },
  { id: "sanctions-check", label: "Sanctions Screening Agent",     desc: "Cross-check entities against global watchlists" },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]           = useState(false);
  const [agentDropOpen, setAgentDropOpen] = useState(false);
  const [ranAgents, setRanAgents]         = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set([BANNER_AGENTS[0].id]));
  const [dropRect, setDropRect]           = useState<DOMRect | null>(null);
  const menuRef           = useRef<HTMLDivElement>(null);
  const agentDropRef      = useRef<HTMLDivElement>(null);
  const agentBtnRef       = useRef<HTMLDivElement>(null);
  const agentPortalRef    = useRef<HTMLDivElement>(null);

  const toggleAgent = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const runSelected = () => {
    if (selectedIds.has("agent-review")) window.dispatchEvent(new CustomEvent("kyc-run-agent-review"));
    setRanAgents(new Set(selectedIds));
    setAgentDropOpen(false);
    setTimeout(() => setRanAgents(new Set()), 3000);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (!agentDropOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const inBtn    = agentDropRef.current?.contains(t);
      const inPortal = agentPortalRef.current?.contains(t);
      if (!inBtn && !inPortal) setAgentDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [agentDropOpen]);

  const isQa = sessionStorage.getItem("persona") === "qa";

  // For QA persona: Dashboard → QA Work Hub; Work Queue link is hidden (already in hub)
  const visibleTabs = tabs.map(tab => {
    if (tab.label === "Dashboard") {
      return isQa
        ? { ...tab, label: "QA Work Queue", path: "/qa-work-hub", match: ["/qa-work-hub", "/qa-dashboard"] }
        : tab;
    }
    if (tab.label === "Work Queue") {
      return isQa
        ? { ...tab, path: "/qa-work-hub", match: ["/qa-work-hub", "/qa-dashboard", "/dashboard", "/case"] }
        : tab;
    }
    return tab;
  }).filter(tab => !(isQa && tab.label === "Work Queue"));

  return (
    <>
      <FloatingTopAppBar
        variant="dark"
        appTitle="KYC Platform"
        onNotificationClick={() => {}}
        onUserClick={() => setMenuOpen((v) => !v)}
        onChatClick={() => window.dispatchEvent(new CustomEvent("kyc-chat-toggle"))}
      />

      {/* Nav links overlaid centered within the floating app bar */}
      <nav
        className="pointer-events-none fixed left-0 right-0 flex items-center justify-center"
        style={{ top: 16, height: 42, zIndex: 101 }}
      >
        <div className="pointer-events-auto flex items-center h-full gap-0">
            {visibleTabs.map((tab) => {
              const isActive = tab.match.includes(location.pathname);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative flex items-center h-full px-4 text-[12px] font-medium tracking-wide text-white transition-colors border-b-2 ${
                    isActive
                      ? "border-white"
                      : "border-transparent hover:border-white/40"
                  }`}
                >
                  {tab.label}
                </Link>
              );
          })}
        </div>
      </nav>

      {/* ── Recommendation Banner ─────────────────────────────────── */}
      <div
        className="w-full flex items-center px-5 gap-3 shrink-0"
        style={{
          height: 40,
          background: "white",
          borderBottom: "1px solid var(--color-neutral-200, #e5e7eb)",
        }}
      >
        {/* Label chip */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap size={12} style={{ color: "var(--color-dark-blue-600, #1a3f8f)" }} aria-hidden />
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: "var(--color-dark-blue-600, #1a3f8f)", letterSpacing: "0.13em" }}
          >
            Recommended Agents
          </span>
        </div>

        <div
          className="w-px h-4 shrink-0"
          style={{ background: "var(--color-dark-blue-200, #a2b8e0)" }}
          aria-hidden
        />

        {/* Recommendation content */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {selectedIds.size === 0 ? (
            <span className="text-[12px] text-neutral-400 italic">No agents selected</span>
          ) : selectedIds.size === 1 ? (() => {
            const a = BANNER_AGENTS.find(x => selectedIds.has(x.id))!;
            return (
              <>
                <span className="text-[12px] font-semibold truncate" style={{ color: "var(--color-neutral-900)" }}>{a.label}</span>
                <span className="text-[11px] truncate hidden sm:inline" style={{ color: "var(--color-neutral-500)" }}>· {a.desc}</span>
              </>
            );
          })() : (
            <span className="text-[12px] font-semibold" style={{ color: "var(--color-neutral-900)" }}>
              {selectedIds.size} agents selected
            </span>
          )}
        </div>

        {/* Actions */}
        <div
          className="banner-actions flex items-center gap-2 shrink-0"
          style={{ transform: "scale(0.8)", transformOrigin: "center right" }}
        >
          {ranAgents.size > 0 ? (
            <span
              className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded"
              style={{ color: "var(--color-green-700, #15803d)", background: "var(--color-green-000, #f0fdf4)" }}
            >
              <Check size={11} aria-hidden /> {ranAgents.size === 1 ? "Agent queued" : `${ranAgents.size} agents queued`}
            </span>
          ) : (
            <Button
              variant="outlined"
              size="small"
              label={selectedIds.size > 1 ? `Run Selected (${selectedIds.size})` : "Run Recommended"}
              disabled={selectedIds.size === 0}
              onClick={runSelected}
            />
          )}

          {/* Run Agent dropdown */}
          <div ref={agentDropRef} className="relative">
            <div ref={agentBtnRef}>
              <Button
                variant="outlined"
                size="small"
                label="Run Agent"
                showIconTrailing
                icon={<ChevronDown size={11} aria-hidden style={{ transition: "transform 0.15s", transform: agentDropOpen ? "rotate(180deg)" : "none" }} />}
                onClick={() => {
                  const rect = agentBtnRef.current?.getBoundingClientRect() ?? null;
                  setDropRect(rect);
                  setAgentDropOpen(o => !o);
                }}
                aria-expanded={agentDropOpen}
                aria-haspopup="true"
              />
            </div>

            {agentDropOpen && dropRect && createPortal(
              <div
                ref={agentPortalRef}
                style={{
                  position: "fixed",
                  top: dropRect.bottom + 6,
                  right: window.innerWidth - dropRect.right,
                  width: 300,
                  background: "white",
                  border: "1px solid var(--color-neutral-200, #e5e7eb)",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 9999,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-050, #f9fafb)" }}>
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--color-neutral-600)" }}>Select Agents</span>
                  <button
                    className="text-[11px] font-medium"
                    style={{ color: "var(--color-dark-blue-600)" }}
                    onClick={() => setSelectedIds(selectedIds.size === BANNER_AGENTS.length ? new Set() : new Set(BANNER_AGENTS.map(a => a.id)))}
                  >
                    {selectedIds.size === BANNER_AGENTS.length ? "Deselect all" : "Select all"}
                  </button>
                </div>

                {/* Agent options */}
                <div className="py-1">
                  {BANNER_AGENTS.map(agent => {
                    const checked = selectedIds.has(agent.id);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className="w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors hover:bg-neutral-50"
                      >
                        {/* Checkbox */}
                        <span
                          className="shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center"
                          style={{
                            border: checked ? "none" : "1.5px solid var(--color-neutral-400)",
                            background: checked ? "var(--color-dark-blue-600)" : "white",
                            transition: "background 0.15s",
                          }}
                          aria-hidden
                        >
                          {checked && <Check size={10} color="white" strokeWidth={3} />}
                        </span>
                        <span className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12px] font-medium" style={{ color: checked ? "var(--color-dark-blue-700)" : "var(--color-neutral-800)" }}>
                            {agent.label}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
                            {agent.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer: Run button */}
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-050, #f9fafb)" }}>
                  <span className="text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
                    {selectedIds.size === 0 ? "No agents selected" : `${selectedIds.size} of ${BANNER_AGENTS.length} selected`}
                  </span>
                  <button
                    onClick={runSelected}
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors"
                    style={{
                      background: selectedIds.size === 0 ? "var(--color-neutral-200)" : "var(--color-dark-blue-600)",
                      color: selectedIds.size === 0 ? "var(--color-neutral-400)" : "white",
                      cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <Play size={10} aria-hidden />
                    Run{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* User menu (anchored top-right) */}
      {menuOpen && (
        <div ref={menuRef} className="fixed right-6 top-20 w-44 bg-white shadow-xl border border-kyc-neutral-200 py-1 z-[200] rounded-lg">
          <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-[12px] font-medium text-kyc-neutral-700 hover:bg-kyc-neutral-50 flex items-center gap-2">
            <User size={13} /> Profile
          </button>
          <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-[12px] font-medium text-kyc-neutral-700 hover:bg-kyc-neutral-50 flex items-center gap-2">
            <Settings size={13} /> Settings
          </button>
          <div className="border-t border-kyc-neutral-200 my-1" />
          <button
            onClick={() => {
              setMenuOpen(false);
              sessionStorage.removeItem("persona");
              navigate("/");
            }}
            className="w-full text-left px-4 py-2 text-[12px] font-medium text-kyc-neutral-700 hover:bg-kyc-neutral-50 flex items-center gap-2"
          >
            <LogOut size={13} /> Switch Persona
          </button>
        </div>
      )}
    </>
  );
}
