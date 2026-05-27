import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Zap, ChevronDown, Check } from "lucide-react";
import { FloatingTopAppBar, Button } from "@kpmg-us/ad-design-lib";

const tabs = [
  { label: "Dashboard",       path: "/analyst-dashboard", match: ["/analyst-dashboard"]           },
  { label: "Work Queue",      path: "/dashboard",         match: ["/dashboard", "/case", "/qa-work-hub", "/qa-dashboard"] },
  { label: "Reports",         path: "/reports",           match: ["/reports"]                     },
];

const BANNER_AGENTS = [
  { id: "bulk-triage",     label: "Bulk Triage Selected Cases",   desc: "Best for high-risk DRG entities in queue" },
  { id: "doc-extraction",  label: "Document Extraction Agent",     desc: "Extract KYC fields from uploaded documents" },
  { id: "sanctions-check", label: "Sanctions Screening Agent",     desc: "Cross-check entities against global watchlists" },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]           = useState(false);
  const [agentDropOpen, setAgentDropOpen] = useState(false);
  const [ranAgent, setRanAgent]           = useState(false);
  const menuRef      = useRef<HTMLDivElement>(null);
  const agentDropRef = useRef<HTMLDivElement>(null);
  const [activeAgent, setActiveAgent]     = useState(BANNER_AGENTS[0]);

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
      if (agentDropRef.current && !agentDropRef.current.contains(e.target as Node)) setAgentDropOpen(false);
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
          <span
            className="text-[12px] font-semibold truncate"
            style={{ color: "var(--color-neutral-900, #0d1117)" }}
          >
            {activeAgent.label}
          </span>
          <span
            className="text-[11px] truncate hidden sm:inline"
            style={{ color: "var(--color-neutral-500, #6b7280)" }}
          >
            · {activeAgent.desc}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0" style={{ transform: "scale(0.8)", transformOrigin: "center right" }}>
          {ranAgent ? (
            <span
              className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded"
              style={{ color: "var(--color-green-700, #15803d)", background: "var(--color-green-000, #f0fdf4)" }}
            >
              <Check size={11} aria-hidden /> Agent queued
            </span>
          ) : (
            <Button
              variant="filled"
              size="small"
              label="Run Recommended"
              onClick={() => { setRanAgent(true); setTimeout(() => setRanAgent(false), 3000); }}
            />
          )}

          {/* Run Agent dropdown */}
          <div ref={agentDropRef} className="relative">
            <Button
              variant="outlined"
              size="small"
              label="Run Agent"
              showIconTrailing
              icon={<ChevronDown size={11} aria-hidden style={{ transition: "transform 0.15s", transform: agentDropOpen ? "rotate(180deg)" : "none" }} />}
              onClick={() => setAgentDropOpen(o => !o)}
              aria-expanded={agentDropOpen}
              aria-haspopup="true"
            />

            {agentDropOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-72 py-1 shadow-lg rounded-lg z-[300]"
                style={{ background: "white", border: "1px solid var(--color-neutral-200, #e5e7eb)" }}
              >
                {BANNER_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => { setActiveAgent(agent); setAgentDropOpen(false); setRanAgent(false); }}
                    className="w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors hover:bg-neutral-50"
                  >
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: activeAgent.id === agent.id ? "var(--color-dark-blue-700, #14307a)" : "var(--color-neutral-800, #1f2937)" }}
                    >
                      {agent.label}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--color-neutral-500, #6b7280)" }}>
                      {agent.desc}
                    </span>
                  </button>
                ))}
              </div>
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
