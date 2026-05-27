import { useState, useEffect, useRef, type CSSProperties } from "react";
import { User, Edit2, Trash2, Plus } from "lucide-react";
import { TopNav } from "@/components/kyc/TopNav";
import {
  applyFilter,
  getQaDashboardViewModel,
  type FilterType,
  type ItemDecision,
} from "./QaDashboardData";
import { QaQueuePanel } from "./components/QaQueuePanel";
import { QaSummaryRail } from "./components/QaSummaryRail";
import { QaEntitySectionTree } from "./components/QaEntitySectionTree";
import { QaReviewLenses } from "./components/QaReviewLenses";
import { QaActionCards } from "./components/QaActionCards";
import { QaDecisionPanel } from "./components/QaDecisionPanel";

const card: CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: "var(--corner-200)",
};

type QaComment = {
  id: number;
  author: string;
  text: string;
  timestamp: string;
  sentToAnalyst?: boolean;
};

export default function QaDashboard() {
  const seed = getQaDashboardViewModel();
  const {
    queue,
    entitySections,
    itemDecisions,
    defaultEntities,
    entityToSectionId,
  } = seed;

  const [focusedEntity] = useState<string>(defaultEntities[0]);

  const [comments, setComments] = useState<QaComment[]>([]);
  const [commentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const addComment = () => {
    if (!commentText.trim()) return;
    const ts = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    setComments(prev => [...prev, { id: Date.now(), author: "Sarah Chen (QA)", text: commentText.trim(), timestamp: ts }]);
    setCommentText("");
  };

  const [queueIdx] = useState(0);
  const [reviewLens,      setReviewLens]       = useState("areas-of-concern");
  const [activeFilter,    setActiveFilter]     = useState<FilterType>("all");
  const [selectedItemId,  setSelectedItemId]   = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId]  = useState<string | null>("o3");
  const [expandedSubs,    setExpandedSubs]     = useState<Set<string>>(new Set());

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const matchingIds = entitySections.flatMap(ent =>
      [...ent.cip, ...ent.dueDiligence]
        .filter(sub => applyFilter(sub.items, activeFilter).length > 0)
        .map(sub => sub.id)
    );
    if (matchingIds.length > 0) {
      setExpandedSubs(prev => {
        const next = new Set(prev);
        matchingIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [activeFilter, entitySections]);

  const queueEntry = queue[queueIdx];

  const toggleSub = (id: string) => setExpandedSubs(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleSelectOwner = (id: string) => { setSelectedOwnerId(prev => prev === id ? null : id); setSelectedItemId(null); };
  const handleSelectItem  = (id: string) => { setSelectedItemId(prev => prev === id ? null : id); setSelectedOwnerId(null); };

  const activeDecision: ItemDecision | null =
    (selectedOwnerId ? itemDecisions[selectedOwnerId] : null) ??
    (selectedItemId  ? itemDecisions[selectedItemId]  : null) ?? null;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex flex-col flex-1">
        <TopNav />
        <header><QaQueuePanel entry={queueEntry} /></header>

        <div className="border-b border-ds-neutral-200 bg-white">
          {commentOpen && (
            <div className="px-6 pt-4 pb-4">
              {comments.length > 0 && (
                <div className="flex flex-col gap-2.5 mb-3 max-h-36 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-ds-dark-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={11} className="text-white" />
                      </div>
                      <div className="flex-1 rounded-lg px-3 py-2" style={{ background: "var(--color-neutral-050,#f9f9f9)", border: "1px solid var(--color-neutral-200)" }}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold text-ds-neutral-900">{c.author}</span>
                          <span className="text-[10px] text-ds-neutral-600">{c.timestamp}</span>
                          <div className="ml-auto flex items-center gap-1">
                            {c.sentToAnalyst
                              ? <span className="text-[10px] font-semibold text-ds-green-700">Sent to Analyst</span>
                              : <button onClick={() => setComments(prev => prev.map(x => x.id === c.id ? { ...x, sentToAnalyst: true } : x))} className="text-[10px] font-semibold text-ds-dark-blue-600 hover:underline">Send to Analyst</button>}
                            <button onClick={() => { setEditingId(c.id); setEditText(c.text); }} className="p-1 text-ds-neutral-500 hover:text-ds-dark-blue-600"><Edit2 size={11} /></button>
                            <button onClick={() => setComments(prev => prev.filter(x => x.id !== c.id))} className="p-1 text-ds-neutral-500 hover:text-ds-red-700"><Trash2 size={11} /></button>
                          </div>
                        </div>
                        {editingId === c.id
                          ? <div className="flex gap-1.5 mt-1"><textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2} autoFocus className="flex-1 text-[11px] px-2 py-1 rounded border border-ds-dark-blue-400 outline-none resize-none" /><button onClick={() => { setComments(prev => prev.map(x => x.id === c.id ? { ...x, text: editText } : x)); setEditingId(null); }} className="px-2 py-1 text-[10px] font-bold text-white rounded" style={{ background: "var(--color-dark-blue-600)" }}>Save</button></div>
                          : <p className="text-[12px] text-ds-neutral-800 leading-snug">{c.text}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-ds-dark-blue-600 flex items-center justify-center shrink-0 mt-1"><User size={11} className="text-white" /></div>
                <div className="flex-1 rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
                    placeholder="Add a review note..." rows={2} className="w-full px-3 py-2 text-[12px] outline-none resize-none bg-white placeholder:text-ds-neutral-600" />
                  <div className="flex justify-end px-3 py-1.5" style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-000)" }}>
                    <button onClick={addComment} disabled={!commentText.trim()} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white disabled:opacity-40" style={{ background: "var(--color-dark-blue-600)" }}><Plus size={11} />Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <main aria-label="QA Review workspace" className="flex-1 flex gap-4 px-6 py-4 overflow-hidden" style={{ minHeight: 0, background: "white" }}>

          <div className="flex-1 min-w-0 rounded-xl flex flex-col overflow-hidden" style={{ ...card, boxShadow: "var(--shadow-200)" }}>
            <QaSummaryRail
              focusedEntity={focusedEntity}
              activeFilter={activeFilter}
              onChangeFilter={setActiveFilter}
            />

            <div className="flex-1 overflow-y-auto min-h-0">
              {entitySections
                .filter(s => s.id === (entityToSectionId[focusedEntity] ?? s.id))
                .map(entity => (
                  <QaEntitySectionTree
                    key={entity.id}
                    entity={entity}
                    expandedSubs={expandedSubs}
                    selectedItemId={selectedItemId}
                    selectedOwnerId={selectedOwnerId}
                    onToggleSub={toggleSub}
                    onSelectItem={handleSelectItem}
                    onSelectOwner={handleSelectOwner}
                    filter={activeFilter}
                  />
                ))
              }
            </div>
          </div>

          <aside aria-label="Action and Resolution panel" className="w-[380px] shrink-0 rounded-xl overflow-hidden flex flex-col" style={{ ...card, boxShadow: "var(--shadow-200)" }}>
            <QaReviewLenses lens={reviewLens} onChangeLens={setReviewLens} />
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeDecision
                ? <QaDecisionPanel decision={activeDecision} key={selectedOwnerId ?? selectedItemId ?? "panel"} />
                : <QaActionCards onSelectItem={handleSelectItem} activeFilter={activeFilter} />
              }
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
}
