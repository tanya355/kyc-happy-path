import {
  X, AlertOctagon, RotateCcw, Send, Info, Globe, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@kpmg-us/ad-design-lib";
import type { QueueEntry } from "../QaDashboardData";
import { StatusPill } from "./StatusPill";

interface QaQueuePanelProps {
  entry: QueueEntry;
}

export function QaQueuePanel({ entry: _entry }: QaQueuePanelProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      <div className="px-4 py-2 border-b border-kyc-neutral-200 bg-white flex items-center gap-0 min-w-0">

        <div className="flex items-center min-w-0 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">DRG</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-kyc-neutral-700 truncate max-w-[180px] leading-none">BlackRock DRG Group</p>
              <Info size={13} className="text-kyc-neutral-600 shrink-0" />
            </div>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Status</p>
            <StatusPill status="in-review" />
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Risk</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              Elevated <AlertTriangle size={13} className="text-ds-red-700" />
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Priority</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              High <ArrowUpRight size={13} className="text-ds-red-700" />
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Customer Type</p>
            <span className="text-[12px] font-semibold text-kyc-neutral-700">Complex Ownership</span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Jurisdiction</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              <Globe size={13} className="text-kyc-neutral-600 shrink-0" /> New York, USA
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Exceptions</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-kyc-neutral-700">
                0<span className="text-[11px] font-normal text-kyc-neutral-600">/5</span>
              </span>
              <span className="text-[10.5px] text-kyc-neutral-700">addressed</span>
            </div>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Due Date</p>
            <span className="text-[12px] font-semibold text-ds-red-700">Apr 25, 2026</span>
          </div>

        </div>

        <div className="shrink-0 flex items-center gap-2 pl-4 ml-2 border-l border-kyc-neutral-200">
          <Button variant="text" size="small" label="Cancel" showIconTrailing icon={<X size={13} />} onClick={() => navigate("/qa-work-hub")} />
          <Button variant="outlined" size="small" label="Escalate" showIconTrailing icon={<AlertOctagon size={13} />} />
          <Button variant="outlined" size="small" label="Rework" showIconTrailing icon={<RotateCcw size={13} />} />
          <Button variant="filled" size="small" label="Submit" showIconTrailing icon={<Send size={13} />} />
        </div>

      </div>
    </div>
  );
}
