'use client';
import { useState, useEffect } from "react";
import type { ReportStats, AppConfig } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#d4af37","#735c00","#9a7f4e","#c49a2f","#e8c84a","#b8970a","#8b7333","#f0d060"];

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [config, setConfig] = useState<AppConfig>({ sources: [], types: [], statuses: [], agents: [] });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());

  function load() {
    setLoading(true);
    Promise.all([
      fetch(`/api/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([rData, cData]) => {
      if (rData.success) setStats(rData.data);
      if (cData.success) setConfig(cData.data);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const byTypeData = stats ? Object.entries(stats.byType).map(([name, value]) => ({ name, value })) : [];
  const bySourceData = stats ? Object.entries(stats.bySource).map(([name, value]) => ({ name, value })) : [];
  const byAgentData = stats ? Object.entries(stats.byAgent).map(([name, value]) => ({ name, tickets: value })) : [];

  const pct = stats && stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Management Analytics</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Deep-dive into operational performance and ticket trends.</p>
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
          Generating report…
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Tickets", value: stats?.total.toLocaleString() ?? "0", icon: "confirmation_number", color: "text-primary" },
              { label: "Resolved", value: stats?.complete.toLocaleString() ?? "0", icon: "check_circle", color: "text-[#166534]" },
              { label: "Pending", value: stats?.pending.toLocaleString() ?? "0", icon: "pending", color: "text-[#92400e]" },
              { label: "Avg Handle Time", value: formatDuration(stats?.avgHandleTime ?? 0), icon: "timer", color: "text-[#1e40af]" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[26px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-[22px] font-bold text-on-surface leading-7">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Completion gauge + agent bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Completion rate */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6 flex flex-col items-center justify-center">
              <p className="text-[13px] text-on-surface-variant uppercase tracking-wider font-semibold mb-4">Completion Rate</p>
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="transparent" stroke="#e6e8ea" strokeWidth="12" />
                  <circle cx="60" cy="60" r="52" fill="transparent" stroke="#22c55e" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[28px] font-bold text-[#166534]">{pct}%</span>
                </div>
              </div>
              <p className="text-[14px] font-semibold text-on-surface">{stats?.complete}/{stats?.total} resolved</p>
            </div>

            {/* Agent workload bar */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <p className="text-[13px] text-on-surface-variant uppercase tracking-wider font-semibold mb-4">Agent Workload Distribution</p>
              {byAgentData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-on-surface-variant text-[14px]">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={byAgentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ea" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8a9099" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8a9099" }} />
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                    <Bar dataKey="tickets" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* By type */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <p className="text-[13px] text-on-surface-variant uppercase tracking-wider font-semibold mb-4">Tickets by Type</p>
              {byTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-[14px]">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {byTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By source */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <p className="text-[13px] text-on-surface-variant uppercase tracking-wider font-semibold mb-4">Tickets by Source</p>
              {bySourceData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-[14px]">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={bySourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {bySourceData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Performance table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright">
              <h2 className="text-[14px] font-semibold text-on-surface">Agent Performance Log</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Agent", "Total Tickets", "Share %"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {byAgentData.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-10 text-on-surface-variant text-[14px]">No data for selected period.</td></tr>
                ) : byAgentData.sort((a, b) => b.tickets - a.tickets).map((row, i) => (
                  <tr key={row.name} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[14px] text-on-surface font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[14px] text-on-surface">{row.tickets.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full rounded-full" style={{
                            width: `${stats?.total ? Math.round((row.tickets / stats.total) * 100) : 0}%`,
                            backgroundColor: COLORS[i % COLORS.length]
                          }} />
                        </div>
                        <span className="text-[13px] text-on-surface-variant">
                          {stats?.total ? Math.round((row.tickets / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strategic insights */}
          <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h2 className="text-[16px] font-semibold text-on-surface">Strategic Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: "trending_up",
                  title: "Top Performing Agent",
                  value: byAgentData.sort((a, b) => b.tickets - a.tickets)[0]?.name ?? "—",
                  desc: `${byAgentData.sort((a, b) => b.tickets - a.tickets)[0]?.tickets ?? 0} tickets handled`,
                },
                {
                  icon: "category",
                  title: "Most Common Type",
                  value: byTypeData.sort((a, b) => b.value - a.value)[0]?.name ?? "—",
                  desc: `${byTypeData.sort((a, b) => b.value - a.value)[0]?.value ?? 0} tickets`,
                },
                {
                  icon: "cell_tower",
                  title: "Busiest Channel",
                  value: bySourceData.sort((a, b) => b.value - a.value)[0]?.name ?? "—",
                  desc: `${bySourceData.sort((a, b) => b.value - a.value)[0]?.value ?? 0} inbound tickets`,
                },
              ].map(({ icon, title, value, desc }) => (
                <div key={title} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                    <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold">{title}</span>
                  </div>
                  <p className="text-[18px] font-bold text-on-surface">{value}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
