'use client';
import { useState, useEffect } from "react";
import type { ReportStats } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const COLORS = ["#d4af37","#735c00","#9a7f4e","#c49a2f","#e8c84a","#b8970a"];

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function today() { return new Date().toISOString().slice(0, 10); }

export default function ExecutivePage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [prevStats, setPrevStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());

  function load() {
    setLoading(true);
    const prevFrom = daysAgo(60);
    const prevTo = daysAgo(31);
    Promise.all([
      fetch(`/api/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
      fetch(`/api/reports?dateFrom=${prevFrom}&dateTo=${prevTo}`).then((r) => r.json()),
    ]).then(([curr, prev]) => {
      if (curr.success) setStats(curr.data);
      if (prev.success) setPrevStats(prev.data);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function delta(curr: number, prev: number) {
    if (!prev) return null;
    const d = Math.round(((curr - prev) / prev) * 100);
    return d;
  }

  const bySourceData = stats ? Object.entries(stats.bySource).map(([name, value]) => ({ name, tickets: value })) : [];
  const byAgentData  = stats ? Object.entries(stats.byAgent).map(([name, value]) => ({ name, tickets: value })) : [];

  const totalDelta  = stats && prevStats ? delta(stats.total, prevStats.total) : null;
  const compDelta   = stats && prevStats ? delta(stats.complete, prevStats.complete) : null;
  const pctDelta    = stats && prevStats && prevStats.total > 0
    ? delta(Math.round((stats.complete / stats.total) * 100), Math.round((prevStats.complete / prevStats.total) * 100))
    : null;
  const timeDelta   = stats && prevStats ? delta(stats.avgHandleTime, prevStats.avgHandleTime) : null;

  const pct = stats && stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  function DeltaBadge({ d, inverse }: { d: number | null; inverse?: boolean }) {
    if (d === null) return null;
    const good = inverse ? d < 0 : d > 0;
    const color = good ? "text-[#166534] bg-[#dcfce7]" : d === 0 ? "text-on-surface-variant bg-surface-container" : "text-[#991b1b] bg-[#fee2e2]";
    const icon = d > 0 ? "arrow_upward" : d < 0 ? "arrow_downward" : "remove";
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
        <span className="material-symbols-outlined text-[12px]">{icon}</span>
        {Math.abs(d)}%
      </span>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Executive Overview</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">High-level performance summary for leadership and stakeholders.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2">
            <span className="text-[12px] text-on-surface-variant">From</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="text-[14px] bg-transparent outline-none text-on-surface" />
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2">
            <span className="text-[12px] text-on-surface-variant">To</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="text-[14px] bg-transparent outline-none text-on-surface" />
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Generating executive report…
        </div>
      ) : (
        <>
          {/* 4 KPI cards with vs previous period */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Volume", value: stats?.total.toLocaleString() ?? "0", icon: "confirmation_number", delta: totalDelta, inverse: false, color: "#735c00" },
              { label: "Resolved", value: stats?.complete.toLocaleString() ?? "0", icon: "check_circle", delta: compDelta, inverse: false, color: "#166534" },
              { label: "Resolution Rate", value: `${pct}%`, icon: "percent", delta: pctDelta, inverse: false, color: "#1e40af" },
              { label: "Avg Handle Time", value: formatDuration(stats?.avgHandleTime ?? 0), icon: "timer", delta: timeDelta, inverse: true, color: "#92400e" },
            ].map(({ label, value, icon, delta: d, inverse, color }) => (
              <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
                  </div>
                  <DeltaBadge d={d} inverse={inverse} />
                </div>
                <p className="text-[24px] font-bold text-on-surface">{value}</p>
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium mt-1">{label}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 opacity-60">vs prev 30 days</p>
              </div>
            ))}
          </div>

          {/* Source breakdown + channel efficiency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Source breakdown */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5">Source Breakdown</h2>
              {bySourceData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-[14px]">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={bySourceData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ea" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#8a9099" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#8a9099" }} width={80} />
                      <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                      <Bar dataKey="tickets" fill="#d4af37" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {bySourceData.sort((a, b) => b.tickets - a.tickets).map((row, i) => (
                      <div key={row.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[13px] text-on-surface flex-1">{row.name}</span>
                        <span className="text-[13px] font-semibold text-on-surface">{row.tickets}</span>
                        <span className="text-[12px] text-on-surface-variant w-10 text-right">
                          {stats?.total ? Math.round((row.tickets / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Channel efficiency matrix */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5">Channel Efficiency Matrix</h2>
              {bySourceData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-[14px]">No data</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {["Channel", "Volume", "Share", "Index"].map((h) => (
                        <th key={h} className="pb-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {bySourceData.sort((a, b) => b.tickets - a.tickets).map((row, i) => {
                      const share = stats?.total ? (row.tickets / stats.total) : 0;
                      const index = Math.round(share * 100 / (100 / bySourceData.length));
                      return (
                        <tr key={row.name} className="hover:bg-surface-container transition-colors">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="text-[13px] text-on-surface">{row.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-[13px] font-semibold text-on-surface">{row.tickets}</td>
                          <td className="py-2.5 text-[13px] text-on-surface-variant">{Math.round(share * 100)}%</td>
                          <td className="py-2.5">
                            <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                              index >= 120 ? "text-[#166534] bg-[#dcfce7]" :
                              index >= 80 ? "text-[#92400e] bg-[#fef3c7]" :
                              "text-[#1e40af] bg-[#dbeafe]"
                            }`}>
                              {index}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Agent summary table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-on-surface">Agent Performance Summary</h2>
              <span className="text-[12px] text-on-surface-variant">{dateFrom} → {dateTo}</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {["#", "Agent", "Tickets Handled", "% of Total", "Performance Tier"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {byAgentData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-on-surface-variant text-[14px]">No agent data for selected period.</td></tr>
                ) : byAgentData.sort((a, b) => b.tickets - a.tickets).map((row, i) => {
                  const share = stats?.total ? (row.tickets / stats.total) * 100 : 0;
                  const tier = share >= 30 ? { label: "Top Performer", color: "text-[#166534] bg-[#dcfce7]" }
                    : share >= 15 ? { label: "Active", color: "text-[#92400e] bg-[#fef3c7]" }
                    : { label: "Standard", color: "text-[#1e40af] bg-[#dbeafe]" };
                  return (
                    <tr key={row.name} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-3 text-[14px] text-on-surface-variant font-medium">{i + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[14px] font-semibold text-on-surface">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-[14px] text-on-surface">{row.tickets.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, share)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-[13px] text-on-surface-variant">{Math.round(share)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${tier.color}`}>{tier.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Executive summary callout */}
          <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-on-surface mb-1">Executive Summary</h2>
                <p className="text-[14px] text-on-surface-variant leading-6">
                  In the selected period, the team processed{" "}
                  <span className="font-semibold text-on-surface">{stats?.total.toLocaleString() ?? 0} tickets</span> with a resolution rate of{" "}
                  <span className="font-semibold text-on-surface">{pct}%</span>.
                  Average handling time was{" "}
                  <span className="font-semibold text-on-surface">{formatDuration(stats?.avgHandleTime ?? 0)}</span>.
                  {byAgentData.length > 0 && (
                    <> Top performer was <span className="font-semibold text-on-surface">{byAgentData.sort((a, b) => b.tickets - a.tickets)[0].name}</span>.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
