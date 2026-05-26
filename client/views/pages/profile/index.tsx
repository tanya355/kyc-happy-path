/**
 * Profile — persona selection screen for the KYC platform.
 *
 * Two personas:
 *   KYC Analyst  → /analyst-dashboard
 *   QA Reviewer  → /qa-work-hub
 *
 * Stores selected persona in sessionStorage so downstream screens
 * can adapt nav labels (e.g. TopNav QA mode).
 *
 * Default export required for route component (architecture convention).
 */

import { useNavigate } from "react-router-dom";
import { ShieldCheck, ClipboardCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Persona = {
  id: "analyst" | "qa";
  label: string;
  description: string;
  destination: string;
  Icon: typeof ShieldCheck;
  accent: string;
  accentBg: string;
};

const PERSONAS: Persona[] = [
  {
    id: "analyst",
    label: "KYC Analyst",
    description: "Review cases, resolve exceptions, and submit decisions for QA approval.",
    destination: "/analyst-dashboard",
    Icon: ShieldCheck,
    accent: "var(--color-dark-blue-600)",
    accentBg: "var(--color-dark-blue-000)",
  },
  {
    id: "qa",
    label: "QA Reviewer",
    description: "Audit analyst decisions, approve or return cases, and ensure compliance quality.",
    destination: "/qa-work-hub",
    Icon: ClipboardCheck,
    accent: "var(--color-green-700)",
    accentBg: "var(--color-green-000)",
  },
];

export default function Profile() {
  const navigate = useNavigate();

  const select = (persona: Persona) => {
    sessionStorage.setItem("persona", persona.id === "qa" ? "qa" : "analyst");
    navigate(persona.destination);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(135deg, var(--color-dark-blue-900, #001030) 0%, var(--color-dark-blue-700, #0a2a6e) 100%)",
      }}
    >
      {/* Logo + heading */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <ShieldCheck size={24} className="text-white" />
        </div>
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">KYC Platform</h1>
        <p className="text-[13px] text-white/60">Select your role to continue</p>
      </div>

      {/* Persona cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => select(p)}
            className={cn(
              "group flex-1 flex flex-col items-start gap-3 p-5 rounded-xl text-left transition-all",
              "bg-white/10 border border-white/20 hover:bg-white/[0.16] hover:border-white/40"
            )}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <p.Icon size={18} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-white mb-1">{p.label}</p>
              <p className="text-[11.5px] text-white/60 leading-snug">{p.description}</p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors">
              Enter as {p.label.split(" ")[0]}
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-[10.5px] text-white/30">KPMG KYC Platform · Internal use only</p>
    </div>
  );
}
