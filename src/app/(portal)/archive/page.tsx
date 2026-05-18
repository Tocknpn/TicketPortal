'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AppConfig } from "@/lib/types";

export default function ArchivePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading…
      </div>
    }>
      <ArchiveInner />
    </Suspense>
  );
}

function ArchiveInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AppConfig>({ sources: [], types: [], statuses: [], agents: [] });
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    dateFrom: "", dateTo: "", agent: "", source: "", type: "", status: "",
  });

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => { if (d.success) setConfig(d.data); });
  }, []);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/archive/results?${params.toString()}`);
  }

  const set = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Historical Archive</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Access legacy ticket records and historical gold transaction logs across all global agent channels.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-lg text-[14px] font-semibold text-on-surface hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export to CSV
        </button>
      </div>

      {/* Filter card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-on-surface-variant">manage_search</span>
          <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider">Advanced Search Filters</h2>
        </div>

        <form onSubmit={runSearch}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">From Date</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">To Date</label>
              <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">Specific Agent</label>
              <select value={filters.agent} onChange={(e) => set("agent", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none">
                <option value="">All Agents</option>
                {config.agents.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">Ticket Type</label>
              <select value={filters.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none">
                <option value="">All Types</option>
                {config.types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">Keyword</label>
              <input value={filters.q} onChange={(e) => set("q", e.target.value)}
                placeholder="UID / Name / Phone"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">Source Channel</label>
              <select value={filters.source} onChange={(e) => set("source", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none">
                <option value="">All Sources</option>
                {config.sources.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-on-surface-variant mb-1.5">Status</label>
              <select value={filters.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-white focus:border-primary-container outline-none">
                <option value="">All Statuses</option>
                {config.statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full bg-primary-container text-on-primary-container text-[14px] font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 shadow-soft hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Run Archive Scan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Empty state */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-40">search</span>
        </div>
        <h3 className="text-[18px] font-semibold text-on-surface mb-2">No Parameters Selected</h3>
        <p className="text-[14px] text-on-surface-variant max-w-md leading-6">
          To view historical data, please configure the advanced search panel above and click "Run Archive Scan". Archives include records dating back to January 2020.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-lg">
          {[
            { icon: "lock", title: "Secure Access",    desc: "All archive requests are logged for security auditing purposes." },
            { icon: "history", title: "Full History",  desc: "Access complete lifecycle tracking for every single gold event." },
            { icon: "file_download", title: "Batch Export", desc: "Generate CSV exports for thousands of records in seconds." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
              <p className="text-[13px] font-semibold text-on-surface">{title}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
