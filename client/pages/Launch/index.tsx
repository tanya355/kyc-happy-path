import { getLaunchData } from "./LaunchData";
import { BackgroundWaves } from "./components/BackgroundWaves";
import { KpmgLogo } from "./components/KpmgLogo";
import { PersonaGrid } from "./components/PersonaGrid";

export default function Launch() {
  const { hero, personas, previewLinks, footer } = getLaunchData();

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(0,145,218,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(100,30,200,0.08) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(0,51,141,0.10) 0%, transparent 55%), #00205B",
      }}
    >
      <BackgroundWaves />

      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 1 }}>

        <div className="text-center mb-12">
          <KpmgLogo />
          <div
            className="mt-4 h-px w-16 mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, #0091DA, transparent)" }}
          />
          <h1 className="mt-5 text-white text-[28px] font-bold tracking-tight">{hero.title}</h1>
          <p className="mt-2 text-white/45 text-[14px]">{hero.subtitle}</p>
          <p
            className="mt-3 mx-auto max-w-sm text-white/30 text-[11px] leading-relaxed border border-white/10 rounded-lg px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span className="text-white/50 font-semibold">{hero.demoNoteLead}</span>
            {hero.demoNote}
          </p>
        </div>

        <PersonaGrid personas={personas} />

        <div className="mt-8 flex items-center gap-2 text-[11px]">
          <span className="text-white/25">Preview:</span>
          {previewLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/20">·</span>}
              <a
                href={link.href}
                className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>

        <p className="mt-4 text-white/20 text-[11px]">{footer}</p>

      </div>
    </div>
  );
}
