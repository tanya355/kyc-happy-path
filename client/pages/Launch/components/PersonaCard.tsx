import { useNavigate } from "react-router";
import { ArrowRight, Shield, ClipboardCheck } from "lucide-react";
import type { PersonaIconKey, PersonaSeed } from "../LaunchData";

function renderPersonaIcon(key: PersonaIconKey) {
  switch (key) {
    case "shield":
      return <Shield size={11} className="text-[#0091DA]" />;
    case "clipboard-check":
      return <ClipboardCheck size={11} className="text-[#0091DA]" />;
  }
}

interface PersonaCardProps {
  data: PersonaSeed;
}

export function PersonaCard({ data }: PersonaCardProps) {
  const navigate = useNavigate();
  const { initials, name, role, description, tasks, iconKey, route, accent, persona } = data;

  return (
    <button
      onClick={() => {
        sessionStorage.setItem("persona", persona);
        navigate(route);
      }}
      className="group relative flex flex-col text-left rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/25 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
    >
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #0091DA, #00B8F1)" }} />

      <div className="px-8 py-8 flex flex-col flex-1 gap-6">

        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white text-[18px] font-bold ${accent}`}>
            {initials}
          </div>
          <div>
            <p className="text-white text-[18px] font-bold leading-tight">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {renderPersonaIcon(iconKey)}
              <p className="text-[#0091DA] text-[12px] font-semibold uppercase tracking-wider">{role}</p>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-[13px] leading-relaxed">{description}</p>

        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-white/50">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#0091DA] shrink-0" />
              {task}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
          <span className="text-[13px] font-semibold text-white/70 group-hover:text-white transition-colors">
            Enter as {name.split(" ")[0]}
          </span>
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-[#0091DA] transition-colors">
            <ArrowRight size={14} className="text-white" />
          </span>
        </div>
      </div>
    </button>
  );
}
