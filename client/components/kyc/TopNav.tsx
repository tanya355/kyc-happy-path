import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { FloatingTopAppBar } from "@kpmg-us/ad-design-lib";

const tabs = [
  { label: "Dashboard",       path: "/analyst-dashboard", match: ["/analyst-dashboard"]           },
  { label: "Work Queue",      path: "/dashboard",         match: ["/dashboard", "/case", "/qa-work-hub", "/qa-dashboard"] },
  { label: "Reports",         path: "/reports",           match: ["/reports"]                     },
  { label: "Evidence Locker", path: "/evidence-locker",   match: ["/evidence-locker"]             },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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
