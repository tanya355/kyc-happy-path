import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, ClipboardCheck } from "lucide-react";

/* ── Full-screen background wave animation ── */
function BackgroundWaves() {
  return (
    <>
      <style>{`
        /* Horizontal sweep animations — paths slide left↔right */
        @keyframes lw-drift-a {
          0%   { transform: translateX(0px)    translateY(0px);   }
          25%  { transform: translateX(60px)   translateY(-18px); }
          50%  { transform: translateX(120px)  translateY(8px);   }
          75%  { transform: translateX(50px)   translateY(-12px); }
          100% { transform: translateX(0px)    translateY(0px);   }
        }
        @keyframes lw-drift-b {
          0%   { transform: translateX(0px)    translateY(0px);  }
          30%  { transform: translateX(-80px)  translateY(20px); }
          60%  { transform: translateX(-140px) translateY(-6px); }
          80%  { transform: translateX(-60px)  translateY(14px); }
          100% { transform: translateX(0px)    translateY(0px);  }
        }
        @keyframes lw-drift-c {
          0%   { transform: translateX(0px)   translateY(0px);   }
          40%  { transform: translateX(100px) translateY(24px);  }
          70%  { transform: translateX(40px)  translateY(-16px); }
          100% { transform: translateX(0px)   translateY(0px);   }
        }
        @keyframes lw-drift-d {
          0%   { transform: translateX(0px)    translateY(0px);  }
          35%  { transform: translateX(-110px) translateY(-20px);}
          65%  { transform: translateX(-55px)  translateY(18px); }
          100% { transform: translateX(0px)    translateY(0px);  }
        }
        /* Continuous one-way horizontal scroll for streaks */
        @keyframes lw-scroll {
          0%   { transform: translateX(-200px); }
          100% { transform: translateX(200px);  }
        }
        @keyframes lw-scroll-rev {
          0%   { transform: translateX(200px);  }
          100% { transform: translateX(-200px); }
        }
        @keyframes lw-fade {
          0%,100% { opacity: 0.22; }
          50%      { opacity: 0.60; }
        }
        @keyframes lw-fade-b {
          0%,100% { opacity: 0.45; }
          50%      { opacity: 0.12; }
        }
        .lwa   { animation: lw-drift-a   13s ease-in-out infinite; }
        .lwb   { animation: lw-drift-b   17s ease-in-out infinite; }
        .lwc   { animation: lw-drift-c   10s ease-in-out infinite; }
        .lwd   { animation: lw-drift-d   15s ease-in-out infinite; }
        .lwsc  { animation: lw-scroll    22s linear      infinite; }
        .lwscr { animation: lw-scroll-rev 28s linear     infinite; }
        .lwf   { animation: lw-fade       9s ease-in-out infinite; }
        .lwfb  { animation: lw-fade-b    13s ease-in-out infinite; }
      `}</style>

      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <defs>
          <filter id="lw-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3"  result="b1" />
            <feGaussianBlur stdDeviation="10" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lw-halo" x="-30%" y="-120%" width="160%" height="340%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="lw-core" x="-20%" y="-120%" width="140%" height="340%">
            <feGaussianBlur stdDeviation="1.5" result="b1" />
            <feGaussianBlur stdDeviation="6"   result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Ambient halos that drift horizontally ── */}
        <g className="lwb lwfb">
          <ellipse cx="720" cy="480" rx="700" ry="200"
            fill="#4C1D95" opacity="0.25" filter="url(#lw-halo)" />
        </g>
        <g className="lwa lwf">
          <ellipse cx="400" cy="580" rx="480" ry="170"
            fill="#3B0764" opacity="0.20" filter="url(#lw-halo)" />
        </g>
        <g className="lwc">
          <ellipse cx="1100" cy="340" rx="400" ry="150"
            fill="#6D28D9" opacity="0.16" filter="url(#lw-halo)" />
        </g>

        {/* ── Wide background strands — drift left & right ── */}
        <g className="lwb" opacity="0.16">
          <path d="M-200,600 C200,420 500,700 720,520 C940,340 1200,620 1640,440"
            fill="none" stroke="#7C3AED" strokeWidth="2.5" filter="url(#lw-halo)" />
        </g>
        <g className="lwa" opacity="0.14">
          <path d="M-200,320 C300,520 600,240 720,400 C840,560 1140,300 1640,480"
            fill="none" stroke="#4C1D95" strokeWidth="3" filter="url(#lw-halo)" />
        </g>
        <g className="lwd" opacity="0.14">
          <path d="M-200,750 C250,560 550,780 780,620 C1010,460 1250,700 1640,560"
            fill="none" stroke="#5B21B6" strokeWidth="2" filter="url(#lw-halo)" />
        </g>

        {/* ── Mid-weight glowing strands — drift opposite directions ── */}
        <g className="lwa" opacity="0.28">
          <path d="M-200,570 C180,370 420,650 720,470 C1020,290 1280,550 1640,370"
            fill="none" stroke="#A855F7" strokeWidth="1.8" filter="url(#lw-glow)" />
        </g>
        <g className="lwc" opacity="0.22">
          <path d="M-200,330 C220,510 500,250 720,410 C940,570 1220,290 1640,490"
            fill="none" stroke="#9333EA" strokeWidth="1.5" filter="url(#lw-glow)" />
        </g>
        <g className="lwb lwf" opacity="0.20">
          <path d="M-200,670 C300,490 560,710 720,550 C880,390 1160,650 1640,490"
            fill="none" stroke="#C084FC" strokeWidth="1.2" filter="url(#lw-glow)" />
        </g>
        <g className="lwd" opacity="0.18">
          <path d="M-200,250 C280,430 540,190 720,350 C900,510 1180,250 1640,410"
            fill="none" stroke="#7C3AED" strokeWidth="1.0" filter="url(#lw-glow)" />
        </g>

        {/* ── Continuously scrolling streak lines (always moving right or left) ── */}
        <g className="lwsc" opacity="0.35">
          <path d="M-300,490 C100,360 400,580 700,440 C1000,300 1300,520 1700,400"
            fill="none" stroke="#A78BFA" strokeWidth="1.2" filter="url(#lw-glow)" />
          <path d="M-300,510 C100,370 400,595 700,455 C1000,315 1300,535 1700,415"
            fill="none" stroke="#C4B5FD" strokeWidth="0.6" filter="url(#lw-glow)" />
        </g>
        <g className="lwscr" opacity="0.28">
          <path d="M-300,620 C150,480 430,660 720,530 C1010,400 1270,590 1700,470"
            fill="none" stroke="#8B5CF6" strokeWidth="1.0" filter="url(#lw-glow)" />
        </g>
        <g className="lwsc" style={{ animationDuration: "34s", animationDelay: "-10s" }} opacity="0.22">
          <path d="M-300,380 C180,280 470,450 730,350 C990,250 1280,420 1700,310"
            fill="none" stroke="#D946EF" strokeWidth="0.8" filter="url(#lw-glow)" />
        </g>
        <g className="lwscr" style={{ animationDuration: "20s", animationDelay: "-5s" }} opacity="0.18">
          <path d="M-300,740 C200,620 490,760 740,660 C990,560 1260,720 1700,620"
            fill="none" stroke="#A855F7" strokeWidth="0.7" filter="url(#lw-glow)" />
        </g>

        {/* ── Bright core threads — drift with glow ── */}
        <g className="lwa" filter="url(#lw-core)">
          <path d="M-200,570 C180,370 420,650 720,470 C1020,290 1280,550 1640,370"
            fill="none" stroke="#E3D2F8" strokeWidth="0.9" opacity="0.55" />
          <path d="M-200,574 C180,374 420,654 720,474 C1020,294 1280,554 1640,374"
            fill="none" stroke="#D3B3FB" strokeWidth="0.5" opacity="0.35" />
        </g>
        <g className="lwc" filter="url(#lw-core)">
          <path d="M-200,330 C220,510 500,250 720,410 C940,570 1220,290 1640,490"
            fill="none" stroke="#E3D2F8" strokeWidth="0.8" opacity="0.45" />
        </g>
        <g className="lwb lwfb" filter="url(#lw-core)">
          <path d="M-200,670 C300,490 560,710 720,550 C880,390 1160,650 1640,490"
            fill="none" stroke="#D3B3FB" strokeWidth="0.7" opacity="0.40" />
        </g>

        {/* ── Continuously scrolling bright core streaks ── */}
        <g className="lwsc" filter="url(#lw-core)" style={{ animationDuration: "22s" }}>
          <path d="M-300,490 C100,360 400,580 700,440 C1000,300 1300,520 1700,400"
            fill="none" stroke="#EDE9FE" strokeWidth="0.7" opacity="0.50" />
        </g>
        <g className="lwscr" filter="url(#lw-core)" style={{ animationDuration: "28s", animationDelay: "-8s" }}>
          <path d="M-300,620 C150,480 430,660 720,530 C1010,400 1270,590 1700,470"
            fill="none" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.40" />
        </g>
      </svg>
    </>
  );
}

function KpmgLogo() {
  return (
    <img
      src="https://cdn.builder.io/api/v1/image/assets%2Ff3d05627e78a4e05ad081010de4d30d1%2F24abfe154a154a009989ff49b5da595d?format=webp&width=800&height=1200"
      alt="KPMG"
      className="h-8 w-auto object-contain brightness-0 invert mx-auto block"
    />
  );
}

interface PersonaCardProps {
  initials:    string;
  name:        string;
  role:        string;
  description: string;
  tasks:       string[];
  icon:        React.ReactNode;
  route:       string;
  accent:      string; // tailwind bg class for avatar
  persona:     "analyst" | "qa";
}

function PersonaCard({ initials, name, role, description, tasks, icon, route, accent, persona }: PersonaCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => { sessionStorage.setItem("persona", persona); navigate(route); }}
      className="group relative flex flex-col text-left rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/25 hover:scale-[1.02] hover:shadow-2xl"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #0091DA, #00B8F1)" }} />

      <div className="px-8 py-8 flex flex-col flex-1 gap-6">

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white text-[18px] font-bold ${accent}`}>
            {initials}
          </div>
          <div>
            <p className="text-white text-[18px] font-bold leading-tight">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {icon}
              <p className="text-[#0091DA] text-[12px] font-semibold uppercase tracking-wider">{role}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/60 text-[13px] leading-relaxed">{description}</p>

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-white/50">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#0091DA] shrink-0" />
              {task}
            </li>
          ))}
        </ul>

        {/* CTA */}
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

export default function Launch() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(0,145,218,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(100,30,200,0.08) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(0,51,141,0.10) 0%, transparent 55%), #00205B",
      }}
    >
      {/* ── Full-screen animated waves ── */}
      <BackgroundWaves />

      {/* ── Page content above waves ── */}
      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="text-center mb-12">
          <KpmgLogo />
          <div className="mt-4 h-px w-16 mx-auto" style={{ background: "linear-gradient(90deg, transparent, #0091DA, transparent)" }} />
          <h1 className="mt-5 text-white text-[28px] font-bold tracking-tight">KYC Platform</h1>
          <p className="mt-2 text-white/45 text-[14px]">Select your role to continue</p>
          <p className="mt-3 mx-auto max-w-sm text-white/30 text-[11px] leading-relaxed border border-white/10 rounded-lg px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-white/50 font-semibold">Demo only.</span> This launch screen is a placeholder.
            The production entry point for each persona will be determined based on authentication,
            role assignment, and session context.
          </p>
        </div>

        {/* Persona cards */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-5">
          <PersonaCard
            initials="AK"
            name="Alex Kim"
            role="KYC Analyst"
            description="Review and resolve KYC exceptions, manage entity processing, and submit cases for approval."
            tasks={[
              "Process DRG entity selections",
              "Review and resolve exceptions",
              "Submit cases for QA approval",
            ]}
            icon={<Shield size={11} className="text-[#0091DA]" />}
          route="/analyst-dashboard"
          accent="bg-[#00338D]"
          persona="analyst"
        />
        <PersonaCard
          initials="QN"
          name="Quinn"
          role="QA Reviewer"
          description="Perform quality assurance review of analyst decisions, validate attributes, and sign off on completed cases."
          tasks={[
            "Review analyst attribute decisions",
            "Validate beneficial owner data",
            "Accept or escalate QA findings",
          ]}
          icon={<ClipboardCheck size={11} className="text-[#0091DA]" />}
          route="/qa-work-hub"
          accent="bg-[#004C97]"
          persona="qa"
          />
        </div>

        {/* Preview links */}
        <div className="mt-8 flex items-center gap-2 text-[11px]">
          <span className="text-white/25">Preview:</span>
          <a href="/analyst-dashboard" className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
            Analyst Dashboard
          </a>
          <span className="text-white/20">·</span>
          <a href="/qa-work-hub" className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
            QA Work Hub
          </a>
        </div>

        {/* Footer */}
        <p className="mt-4 text-white/20 text-[11px]">
          KPMG KYC Platform · Confidential
        </p>

      </div>
    </div>
  );
}
