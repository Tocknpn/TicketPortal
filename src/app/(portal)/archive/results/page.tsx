'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Ticket } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/utils";

const ROWS = 50;

export default function ArchiveResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading…
      </div>
    }>
      <ArchiveResultsInner />
    </Suspense>
  );
}

function ArchiveResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ mode: "search" });
    searchParams.forEach((v, k) => params.set(k, v));
    fetch(`/api/tickets?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTickets(d.data); setLoading(false); });
  }, [searchParams]);

  function exportCSV() {
    const headers = ["Ticket UID","Start Date","End Date","Agent","Customer Name","Phone","Source","Type","Status","Resolution","Attachment"];
    const rows = tickets.map((t) => [
      t.uid, t.startTime, t.endTime ?? "", t.agentName,
      t.customerName, t.customerPhone, t.source, t.type,
      t.status, t.resolution, t.attachmentUrl,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = "data:text/csv;charset=utf-8,﻿" + headers.join(",") + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `EasyGold_Export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }

  const total  = tickets.length;
  const pages  = Math.max(1, Math.ceil(total / ROWS));
  const sliced = tickets.slice((page-1)*ROWS, page*ROWS);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-on-surface-variant mb-6">
        <button onClick={() => router.push("/archive")} className="hover:text-primary transition-colors">Historical Archive</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Search Results</span>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Archive Search Results</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">
            Showing {total.toLocaleString()} record{total !== 1 ? "s" : ""} for query "{searchParams.get("q") || "all"}"
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-lg text-[14px] font-semibold text-on-surface hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export to CSV
        </button>
      </div>

      {/* Summary stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Records", value: total.toLocaleString(), icon: "confirmation_number" },
            { label: "Complete", value: tickets.filter(t => t.status==="Complete").length.toLocaleString(), icon: "check_circle" },
            { label: "Pending", value: tickets.filter(t => t.status!=="Complete").length.toLocaleString(), icon: "pending" },
            { label: "With Attachments", value: tickets.filter(t => t.attachmentUrl).length.toLocaleString(), icon: "attach_file" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-[28px]">{icon}</span>
              <div>
                <p className="text-[12px] text-on-surface-variant font-medium uppercase tracking-wider">{label}</p>
                <p className="text-[20px] font-bold text-on-surface">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Scanning archive…
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <span className="text-[14px] font-semibold text-on-surface">Search Results List</span>
              <span className="text-[12px] text-on-surface-variant">{total} Active Selections</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {["TICKET ID","DATE","CUSTOMER","SOURCE","TYPE","STATUS","AGENT","ACTIONS"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {sliced.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-on-surface-variant text-[14px]">No records found.</td></tr>
                ) : sliced.map((t) => (
                  <tr key={t.uid} className="hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => router.push(`/tickets/${t.uid}`)}>
                    <td className="px-5 py-3 text-[13px] font-bold text-primary">{t.uid}</td>
                    <td className="px-5 py-3 text-[13px] text-on-surface-variant">{t.startTime ? formatDateTime(t.startTime) : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={t.customerName} size={7} />
                        <div>
                          <p className="text-[13px] text-on-surface font-medium">{t.customerName}</p>
                          <p className="text-[12px] text-on-surface-variant">{t.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-on-surface-variant">{t.source}</td>
                    <td className="px-5 py-3 text-[13px] text-on-surface-variant max-w-[160px] truncate">{t.type}</td>
                    <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3 text-[13px] text-on-surface">{t.agentName}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => router.push(`/tickets/${t.uid}`)}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="View">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">visibility</span>
                        </button>
                        <button onClick={() => router.push(`/tickets/${t.uid}/edit`)}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                        </button>
                        {t.attachmentUrl && (
                          <a href={t.attachmentUrl} target="_blank" rel="noreferrer"
                            className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Attachment">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">attach_file</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > ROWS && (
              <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
                <span className="text-[14px] text-on-surface-variant">
                  {(page-1)*ROWS+1}–{Math.min(page*ROWS, total)} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="p-1 hover:bg-surface-container rounded disabled:opacity-40">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => i+1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded text-[12px] font-medium ${page===p ? "bg-primary text-on-primary" : "hover:bg-surface-container"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                    className="p-1 hover:bg-surface-container rounded disabled:opacity-40">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Data integrity banner */}
      <div className="mt-6 bg-primary-container/10 border border-primary-container/30 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
        <div>
          <p className="text-[14px] font-semibold text-primary">Historical Data Integrity</p>
          <p className="text-[13px] text-on-surface-variant mt-0.5">All archived records are cryptographically signed and stored in immutable compliance storage for auditing purposes.</p>
        </div>
      </div>
    </div>
  );
}
