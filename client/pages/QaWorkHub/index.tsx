import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/kyc/TopNav";
import { DrgTable } from "@/components/kyc/DrgTable";
import {
  WorkQueueFilters,
  EMPTY_WQ_FILTERS,
} from "@/components/kyc/WorkQueueFilterPanel";
import { getQaWorkHubData, type QaViewKey } from "./QaWorkHubData";
import { QaToolbar } from "./components/QaToolbar";

export default function QaWorkHub() {
  const navigate = useNavigate();
  const seed = getQaWorkHubData();

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<QaViewKey>("all");
  const [filters, setFilters] = useState<WorkQueueFilters>(EMPTY_WQ_FILTERS);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <div className="relative flex flex-col flex-1">

        <TopNav />

        <QaToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          viewOptions={seed.viewOptions}
          activeView={activeView}
          onActiveViewChange={setActiveView}
        />

        <main
          className="flex-1 overflow-y-auto px-6 pt-4 pb-6 text-[14px]"
          aria-label="QA Work Queue"
        >
          <DrgTable
            selected={new Set()}
            onSelectionChange={() => {}}
            filters={filters}
            statusMap={seed.statusMap}
            hideGroupCheckbox
            hideAllCheckboxes
            onEntityClick={() => navigate("/qa-dashboard")}
          />
        </main>

      </div>
    </div>
  );
}
