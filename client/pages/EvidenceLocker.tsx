import { TopNav } from "@/components/kyc/TopNav";
import { StaticWisps } from "@/components/kyc/StaticWisps";
import { Lock } from "lucide-react";

const BG = [
  "radial-gradient(ellipse 220% 18% at 30% 32%, rgba(0,100,200,0.038) 0%, transparent 100%)",
  "radial-gradient(ellipse 200% 14% at 70% 55%, rgba(75,0,165,0.028) 0%, transparent 100%)",
  "radial-gradient(ellipse 210% 16% at 45% 72%, rgba(0,51,141,0.032) 0%, transparent 100%)",
  "radial-gradient(ellipse 180% 12% at 85% 20%, rgba(0,125,205,0.022) 0%, transparent 100%)",
  "#EDF1F8",
].join(", ");

export default function EvidenceLocker() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      <StaticWisps />
      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm rounded-2xl px-10 py-10" style={{ background: "rgba(255,255,255,0.52)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: "1px solid rgba(0,51,141,0.13)", boxShadow: "0 4px 32px rgba(0,51,141,0.07), inset 0 1px 0 rgba(255,255,255,0.75)" }}>
            <div className="w-16 h-16 rounded-full bg-kyc-blue-light border border-kyc-blue-mid/40 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-kyc-blue" />
            </div>
            <h2 className="text-lg font-semibold text-kyc-neutral-800 mb-2">Evidence Locker</h2>
            <p className="text-sm text-kyc-neutral-600 leading-relaxed">
              This section is coming soon. Continue prompting to build out document storage,
              evidence linking, and audit trail functionality.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
