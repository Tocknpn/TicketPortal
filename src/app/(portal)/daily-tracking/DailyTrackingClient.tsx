'use client';
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Ticket, AppConfig } from "@/lib/types";
import ChannelIcon from "@/components/ui/ChannelIcon";
import Avatar from "@/components/ui/Avatar";
import NewTicketModal from "./NewTicketModal";
import { formatDateTime } from "@/lib/utils";

const ROWS_PER_PAGE = 50;

export default function DailyTrackingClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [config, setConfig]       = useState<AppConfig>({ sources: [], types: [], statuses: [], agents: [] });
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ search: "", agent: "", source: "", status: "", type: "", dateFrom: "", dateTo: "" });
  const [activeTab, setActiveTab] = useState<"all"|"mine"|"priority">("all");
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [sortCol, setSortCol]     = useState<keyof Ticket>("startTime");
  const [sortDir, setSortDir]     = useState<"asc"|"desc">("desc");

  const agentEmail = session?.user?.email ?? "";
  const isAdmin    = (session?.user as { role?: string })?.role === "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    const [tRes, cRes] = await Promise.all([
      fetch("/api/tickets"),
      fetch("/api/config"),
    ]);
    const tData = await tRes.json();
    const cData = await cRes.json();
    if (tData.success) setTickets(tData.data);
    if (cData.success) setConfig(cData.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Open modal if URL has ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") setShowModal(true);
  }, [searchParams]);

  const filtered = tickets.filter((t) => {
    const q = filter.search.toUpperCase();
    const matchSearch = !q || t.uid.toUpperCase().includes(q) || t.customerName.toUpperCase().includes(q) || t.customerPhone.includes(q);
    const matchAgent  = !filter.agent  || t.agentName === filter.agent;
    const matchSource = !filter.source || t.source === filter.source;
    const matchStatus = !filter.status || t.status === filter.status;
    const matchType   = !filter.type   || t.type === filter.type;
    const matchFrom   = !filter.dateFrom || (t.startTime >= filter.dateFrom);
    const matchTo     = !filter.dateTo   || (t.startTime <= filter.dateTo + "T23:59:59");
    const matchTab    = activeTab === "all"      ? true
                      : activeTab === "mine"     ? t.agentEmail === agentEmail
                      : t.status !== "Complete";
    return matchSearch && matchAgent && matchSource && matchStatus && matchType && matchFrom && matchTo && matchTab;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortCol] ?? "";
    const bv = b[sortCol] ?? "";
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total    = sorted.length;
  const complete = sorted.filter((t) => t.status === "Complete").length;
  const pct      = total > 0 ? Math.round((complete / total) * 100) : 0;
  const pending  = total - complete;

  const pages   = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const sliced  = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] font-semibold leading-9 text-on-surface">Daily Management</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Manage your active support queue and track performance metrics.</p>
        </div>

        {/* KPI Gauges */}
        <div className="flex gap-4">
          <KpiGauge label="COMPLETE" value={`${complete}/${total}`} pct={pct} color="#22c55e" textColor="#166534" />
          <KpiGauge label="PENDING"  value={`${pending} Tickets`}  pct={100-pct} color="#f59e0b" textColor="#92400e" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-soft">
        <div className="flex items-center gap-4">
          {/* Tab buttons */}
          <div className="flex border border-outline-variant rounded-lg overflow-hidden">
            {(["all","mine","priority"] as const).map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-4 py-2 text-[14px] font-semibold transition-colors ${i > 0 ? "border-l border-outline-variant" : ""} ${activeTab === tab ? "bg-secondary-container text-on-secondary-container" : "hover:bg-surface-container-high"}`}
              >
                {tab === "all" ? "All Tickets" : tab === "mine" ? "My Active" : "Priority"}
              </button>
            ))}
          </div>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#22c55e] text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-soft hover:brightness-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          New Ticket
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={filter.search}
          onChange={(e) => { setFilter(f => ({ ...f, search: e.target.value })); setPage(1); }}
          placeholder="Search UID / Name / Phone…"
          className="px-3 py-1.5 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none focus:border-primary-container w-52"
        />
        {[
          { key: "agent",  opts: config.agents,  label: "Agent"  },
          { key: "source", opts: config.sources, label: "Source" },
          { key: "status", opts: config.statuses,label: "Status" },
          { key: "type",   opts: config.types,   label: "Type"   },
        ].map(({ key, opts, label }) => (
          <select
            key={key}
            value={(filter as Record<string,string>)[key]}
            onChange={(e) => { setFilter(f => ({ ...f, [key]: e.target.value })); setPage(1); }}
            className="px-3 py-1.5 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none focus:border-primary-container"
          >
            <option value="">All {label}s</option>
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        <input type="date" value={filter.dateFrom} onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
          className="px-3 py-1.5 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none" />
        <input type="date" value={filter.dateTo} onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
          className="px-3 py-1.5 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none" />
        <button onClick={load} className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading tickets…
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                {([
                  { label: "TICKET ID",      col: "uid"          },
                  { label: "CUSTOMER NAME",  col: "customerName" },
                  { label: "CHANNEL",        col: "source"       },
                  { label: "ASSIGNED AGENT", col: "agentName"    },
                  { label: "START TIME",     col: "startTime"    },
                ] as { label: string; col: keyof Ticket }[]).map(({ label, col }) => (
                  <th
                    key={col}
                    onClick={() => { if (sortCol === col) { setSortDir(d => d === "asc" ? "desc" : "asc"); } else { setSortCol(col); setSortDir("asc"); } setPage(1); }}
                    className="px-6 py-4 text-[12px] font-medium text-on-surface-variant uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortCol === col
                        ? <span className="material-symbols-outlined text-[14px] text-primary">{sortDir === "asc" ? "arrow_upward" : "arrow_downward"}</span>
                        : <span className="material-symbols-outlined text-[14px] opacity-30">swap_vert</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {sliced.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-on-surface-variant text-[14px]">No tickets found.</td></tr>
              ) : sliced.map((t) => (
                  <tr
                    key={t.uid}
                    className="hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => router.push(`/tickets/${t.uid}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-primary">
                        {t.uid} {t.attachmentUrl && <span className="text-on-surface-variant">📎</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={t.customerName} />
                        <span className="text-[16px] text-on-surface">{t.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><ChannelIcon channel={t.source} /></td>
                    <td className="px-6 py-4">
                      {t.agentName ? (
                        <span className="text-[14px] text-on-surface">{t.agentName}</span>
                      ) : (
                        <span className="text-[14px] text-error italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-[14px] text-on-surface-variant">
                      {t.startTime ? formatDateTime(t.startTime) : "—"}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
            <p className="text-[14px] text-on-surface-variant">
              Showing {(page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, total)} of {total} results
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="p-1 hover:bg-surface-container rounded disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${page===p ? "bg-primary text-on-primary" : "hover:bg-surface-container"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
                className="p-1 hover:bg-surface-container rounded disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <NewTicketModal
          config={config}
          agentEmail={agentEmail}
          agentName={session?.user?.name ?? ""}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

/* KPI Gauge component (inline) */
function KpiGauge({ label, value, pct, color, textColor }: { label: string; value: string; pct: number; color: string; textColor: string }) {
  const r = 20; const c = 2 * Math.PI * r;
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-soft flex items-center gap-4 min-w-[180px]">
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={r} fill="transparent" stroke="#e6e8ea" strokeWidth="4" />
          <circle cx="24" cy="24" r={r} fill="transparent" stroke={color} strokeWidth="4"
            strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-semibold" style={{ color: textColor }}>{pct}%</span>
      </div>
      <div>
        <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-[18px] font-bold leading-6" style={{ color: textColor }}>{value}</p>
      </div>
    </div>
  );
}
