import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/kyc/TopNav";
import { DrgTable, Entity } from "@/components/kyc/DrgTable";
import {
  WorkQueueFilters,
  EMPTY_WQ_FILTERS,
} from "@/components/kyc/WorkQueueFilterPanel";
import { getHomeData, type HomeViewKey } from "./HomeData";
import { HomeToolbar } from "./components/HomeToolbar";

export default function Home() {
  const navigate = useNavigate();
  const seed = getHomeData();

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<HomeViewKey>("all");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(seed.initialSelectedIds),
  );
  const [filters, setFilters] = useState<WorkQueueFilters>(EMPTY_WQ_FILTERS);

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <div className="flex flex-col flex-1">
        <TopNav />

        <HomeToolbar
          search={search}
          onSearchChange={setSearch}
          searchResultCount={seed.searchResultCount}
          filters={filters}
          onFiltersChange={setFilters}
          viewOptions={seed.viewOptions}
          activeView={activeView}
          onActiveViewChange={setActiveView}
          selectedCount={selected.size}
          onReviewSelected={() => navigate("/case")}
        />

        <main aria-label="DRG case queue" className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          <DrgTable
            selected={selected}
            onSelectionChange={setSelected}
            filters={filters}
            onEntityClick={(entity: Entity) =>
              navigate("/case", {
                state: { entity: entity.name, entityId: entity.id, singleEntity: true },
              })
            }
          />
        </main>
      </div>
    </div>
  );
}
