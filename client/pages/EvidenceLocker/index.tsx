import { Lock } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { StaticWisps } from "@/components/kyc/StaticWisps";
import { getEvidenceLockerData } from "./EvidenceLockerData";
import { PlaceholderCard } from "./components/PlaceholderCard";

export default function EvidenceLocker() {
  const { background, placeholder } = getEvidenceLockerData();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background }}>
      <StaticWisps />
      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-8">
          <PlaceholderCard
            icon={<Lock size={28} className="text-kyc-blue" />}
            title={placeholder.title}
            body={placeholder.body}
          />
        </main>
      </div>
    </div>
  );
}
