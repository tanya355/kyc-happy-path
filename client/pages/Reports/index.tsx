import { BarChart3, FileText } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import { StaticWisps } from "@/components/kyc/StaticWisps";
import { getReportsData } from "./ReportsData";
import { PlaceholderCard } from "./components/PlaceholderCard";

export default function Reports() {
  const { background, placeholder } = getReportsData();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background }}>
      <StaticWisps />
      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-8">
          <PlaceholderCard
            icon={<BarChart3 size={28} className="text-kyc-blue" />}
            title={placeholder.title}
            body={placeholder.body}
            footer={
              <>
                <FileText size={13} />
                <span>{placeholder.footer}</span>
              </>
            }
          />
        </main>
      </div>
    </div>
  );
}
