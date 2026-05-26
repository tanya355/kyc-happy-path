import { useRef } from "react";
import { X, Printer } from "lucide-react";
import { exceptions } from "./ExceptionsPanel";

const ENTITY_CASE_NUMBERS: Record<string, string> = {
  "BlackRock Advisors":      "KYC-28821",
  "BlackRock Institutional": "KYC-28834",
  "Entity 13":               "KYC-29107",
};

const SELECTED_ENTITIES = ["BlackRock Advisors", "BlackRock Institutional", "Entity 13"];

const today = new Date().toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric",
});

interface CaseDocumentModalProps {
  onClose: () => void;
}

export function CaseDocumentModal({ onClose }: CaseDocumentModalProps) {
  const docRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = docRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KYC Case Summary — BlackRock DRG Group</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 40px; }
            .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #00338D; padding-bottom: 16px; margin-bottom: 24px; }
            .kpmg-wordmark { font-size: 22px; font-weight: 900; letter-spacing: 0.12em; color: #00338D; }
            .doc-title { font-size: 16px; font-weight: 700; color: #00338D; margin-bottom: 2px; }
            .doc-subtitle { font-size: 11px; color: #555; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px 24px; background: #f5f7fb; border: 1px solid #d0d8ec; padding: 14px 18px; margin-bottom: 24px; border-radius: 2px; }
            .meta-item label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #666; display: block; margin-bottom: 2px; }
            .meta-item span { font-size: 12px; font-weight: 600; color: #1a1a1a; }
            h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #00338D; border-bottom: 1px solid #d0d8ec; padding-bottom: 5px; margin-bottom: 12px; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 8px; }
            th { background: #00338D; color: #fff; font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; padding: 7px 10px; text-align: left; }
            td { padding: 7px 10px; border-bottom: 1px solid #e8ecf4; color: #222; vertical-align: top; }
            tr:nth-child(even) td { background: #f9fafc; }
            .badge { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 9px; font-weight: 700; }
            .badge-red { background: #fff0f0; color: #c00; border: 1px solid #fcc; }
            .badge-yellow { background: #fffbe6; color: #7a5c00; border: 1px solid #f0d87a; }
            .badge-green { background: #f0fff4; color: #1a7a3c; border: 1px solid #a3d9b3; }
            .badge-blue { background: #f0f4ff; color: #00338D; border: 1px solid #b3c6f0; }
            .conf-high { color: #1a7a3c; font-weight: 700; }
            .conf-med  { color: #7a5c00; font-weight: 700; }
            .conf-low  { color: #c00; font-weight: 700; }
            .footer { margin-top: 40px; border-top: 1px solid #d0d8ec; padding-top: 14px; display: flex; justify-content: space-between; font-size: 9px; color: #888; }
            .sign-area { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
            .sign-box { border-top: 1px solid #999; padding-top: 6px; font-size: 9px; color: #555; }
            @media print { body { padding: 24px; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const typeLabel: Record<string, string> = {
    "discrepancy":  "Discrepancy",
    "missing-doc":  "Missing Document",
    "validation":   "Validation",
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,20,60,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal shell */}
      <div
        className="relative flex flex-col rounded-xl overflow-hidden"
        style={{
          width: 760,
          maxHeight: "90vh",
          background: "#fff",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          border: "1px solid var(--color-neutral-200)",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-dark-blue-000)" }}
        >
          <div>
            <p className="text-[13px] font-bold text-ds-dark-blue-600">Client Case Summary Document</p>
            <p className="text-[10px] text-ds-neutral-600 mt-0.5">Internal use · For client distribution</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: "var(--color-dark-blue-600)" }}
            >
              <Printer size={12} />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-ds-neutral-500 hover:text-ds-neutral-800 hover:bg-ds-neutral-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable document preview */}
        <div className="flex-1 overflow-y-auto p-6" style={{ background: "#f0f2f6" }}>
          {/* Paper */}
          <div
            ref={docRef}
            className="mx-auto"
            style={{ background: "#fff", padding: "40px 48px", maxWidth: 680, boxShadow: "0 2px 24px rgba(0,0,0,0.10)" }}
          >
            {/* Header */}
            <div className="doc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #00338D", paddingBottom: 16, marginBottom: 24 }}>
              <div>
                <div className="kpmg-wordmark" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.12em", color: "#00338D", fontFamily: "Arial, sans-serif" }}>KPMG</div>
                <p style={{ fontSize: 10, color: "#666", marginTop: 2, fontFamily: "Arial, sans-serif" }}>Know Your Customer — Case Summary</p>
              </div>
              <div style={{ textAlign: "right", fontFamily: "Arial, sans-serif" }}>
                <p className="doc-title" style={{ fontSize: 15, fontWeight: 700, color: "#00338D" }}>KYC Case Summary</p>
                <p style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Reference: KYC-28821 / KYC-28834 / KYC-29107</p>
                <p style={{ fontSize: 10, color: "#555" }}>Date: {today}</p>
                <p style={{ fontSize: 10, color: "#555" }}>Classification: Internal — Client Distribution</p>
              </div>
            </div>

            {/* Case Metadata */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px", background: "#f5f7fb", border: "1px solid #d0d8ec", padding: "14px 18px", marginBottom: 28, borderRadius: 2, fontFamily: "Arial, sans-serif" }}>
              {[
                { label: "DRG / Client Group", value: "BlackRock DRG Group" },
                { label: "Risk Rating",         value: "Elevated" },
                { label: "Priority",            value: "High" },
                { label: "Customer Type",       value: "Complex Ownership" },
                { label: "Jurisdiction",        value: "New York, USA" },
                { label: "Due Date",            value: "Apr 25, 2026" },
                { label: "Total Exceptions",    value: `${exceptions.length}` },
                { label: "Review Type",         value: "Periodic Refresh" },
                { label: "Prepared By",         value: "KPMG KYC Operations" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", display: "block", marginBottom: 2 }}>{f.label}</label>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{f.value}</span>
                </div>
              ))}
            </div>

            {/* Selected Entities */}
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00338D", borderBottom: "1px solid #d0d8ec", paddingBottom: 5, marginBottom: 12, fontFamily: "Arial, sans-serif" }}>
              Entities Under Review
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 24, fontFamily: "Arial, sans-serif" }}>
              <thead>
                <tr>
                  {["Entity Name", "Case Number", "Jurisdiction", "Risk Rating", "Review Type"].map(h => (
                    <th key={h} style={{ background: "#00338D", color: "#fff", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", padding: "7px 10px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SELECTED_ENTITIES.map((name, i) => (
                  <tr key={name}>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>{name}</td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e8ecf4", fontFamily: "monospace", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>{ENTITY_CASE_NUMBERS[name]}</td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>New York, USA</td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>
                      <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 10, fontSize: 9, fontWeight: 700, background: "#fff0f0", color: "#c00", border: "1px solid #fcc" }}>Elevated</span>
                    </td>
                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>Periodic Refresh</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Exceptions */}
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00338D", borderBottom: "1px solid #d0d8ec", paddingBottom: 5, marginBottom: 12, fontFamily: "Arial, sans-serif" }}>
              Exception Summary ({exceptions.length} items)
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, marginBottom: 28, fontFamily: "Arial, sans-serif" }}>
              <thead>
                <tr>
                  {["#", "Entity", "Case No.", "Exception", "Type", "Description", "Confidence", "Status"].map(h => (
                    <th key={h} style={{ background: "#00338D", color: "#fff", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", padding: "7px 8px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exceptions.map((ex, i) => {
                  const confColor = ex.confidence >= 90 ? "#1a7a3c" : ex.confidence >= 75 ? "#7a5c00" : "#c00";
                  return (
                    <tr key={i}>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", color: "#888", fontSize: 9 }}>{i + 1}</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", fontWeight: 600 }}>{ex.entity}</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", fontFamily: "monospace", fontSize: 9.5 }}>{ENTITY_CASE_NUMBERS[ex.entity] ?? "—"}</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", fontWeight: 600 }}>{ex.title}</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>
                        <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 10, fontSize: 8.5, fontWeight: 700, background: "#f0f4ff", color: "#00338D", border: "1px solid #b3c6f0" }}>{typeLabel[ex.type]}</span>
                      </td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", maxWidth: 180, fontSize: 10 }}>{ex.body}</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff", fontWeight: 700, color: confColor }}>{ex.confidence}%</td>
                      <td style={{ padding: "7px 8px", borderBottom: "1px solid #e8ecf4", background: i % 2 === 1 ? "#f9fafc" : "#fff" }}>
                        <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 10, fontSize: 9, fontWeight: 700, background: ex.status === "Resolved" ? "#f0fff4" : "#fffbe6", color: ex.status === "Resolved" ? "#1a7a3c" : "#7a5c00", border: `1px solid ${ex.status === "Resolved" ? "#a3d9b3" : "#f0d87a"}` }}>{ex.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Analyst Sign-off */}
            <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00338D", borderBottom: "1px solid #d0d8ec", paddingBottom: 5, marginBottom: 16, fontFamily: "Arial, sans-serif" }}>
              Analyst Sign-off
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 36, fontFamily: "Arial, sans-serif" }}>
              {["Prepared By", "Reviewed By", "Approved By"].map(role => (
                <div key={role}>
                  <div style={{ borderTop: "1px solid #999", paddingTop: 6 }}>
                    <p style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>{role}</p>
                    <p style={{ fontSize: 9, color: "#aaa", marginTop: 18 }}>Signature / Date</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid #d0d8ec", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 9, color: "#aaa", fontFamily: "Arial, sans-serif" }}>
              <span>KPMG LLP · KYC Operations · Confidential</span>
              <span>Generated: {today} · Internal Use Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
