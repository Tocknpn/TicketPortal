'use client';
import { useState, useEffect } from "react";
import type { AppConfig } from "@/lib/types";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";

const SHIFTS = ["Morning (08:00–16:00)", "Afternoon (14:00–22:00)", "Evening (17:00–01:00)"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AgentRow {
  name: string;
  email: string;
  role: string;
  tickets: number;
  status: "Active" | "Away" | "Offline";
  shift: string;
}

const MOCK_AGENTS: AgentRow[] = [
  { name: "Somchai Jaidee",  email: "somchai@easygold.th",  role: "Admin",    tickets: 142, status: "Active",  shift: SHIFTS[0] },
  { name: "Napaporn Wichit", email: "napaporn@easygold.th", role: "Standard", tickets: 98,  status: "Active",  shift: SHIFTS[0] },
  { name: "Krit Thongchai",  email: "krit@easygold.th",     role: "Standard", tickets: 87,  status: "Away",   shift: SHIFTS[1] },
  { name: "Lalita Somboon",  email: "lalita@easygold.th",   role: "Standard", tickets: 63,  status: "Active",  shift: SHIFTS[1] },
  { name: "Prawit Ngamjit",  email: "prawit@easygold.th",   role: "Standard", tickets: 44,  status: "Offline", shift: SHIFTS[2] },
  { name: "Supannee Ruk",    email: "supannee@easygold.th", role: "Standard", tickets: 31,  status: "Offline", shift: SHIFTS[2] },
];

const SCHEDULE: Record<string, string[]> = {
  "Somchai Jaidee":  ["Morning (08:00–16:00)", "Morning (08:00–16:00)", "Morning (08:00–16:00)", "Morning (08:00–16:00)", "Morning (08:00–16:00)", "", ""],
  "Napaporn Wichit": ["Morning (08:00–16:00)", "Morning (08:00–16:00)", "", "Morning (08:00–16:00)", "Morning (08:00–16:00)", "Afternoon (14:00–22:00)", ""],
  "Krit Thongchai":  ["", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", ""],
  "Lalita Somboon":  ["", "", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)", "Afternoon (14:00–22:00)"],
  "Prawit Ngamjit":  ["Evening (17:00–01:00)", "", "Evening (17:00–01:00)", "", "Evening (17:00–01:00)", "Evening (17:00–01:00)", "Evening (17:00–01:00)"],
  "Supannee Ruk":    ["", "Evening (17:00–01:00)", "", "Evening (17:00–01:00)", "", "Evening (17:00–01:00)", "Evening (17:00–01:00)"],
};

const SHIFT_COLORS: Record<string, string> = {
  [SHIFTS[0]]: "bg-[#dbeafe] text-[#1e40af]",
  [SHIFTS[1]]: "bg-[#fef3c7] text-[#92400e]",
  [SHIFTS[2]]: "bg-[#ede9fe] text-[#5b21b6]",
};

const STATUS_META: Record<AgentRow["status"], { dot: string; label: string }> = {
  Active:  { dot: "bg-[#22c55e]", label: "Active" },
  Away:    { dot: "bg-[#f59e0b]", label: "Away" },
  Offline: { dot: "bg-[#94a3b8]", label: "Offline" },
};

export default function TeamManagementPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<AgentRow[]>(MOCK_AGENTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"roster"|"schedule"|"distribution">("roster");

  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const totalTickets = agents.reduce((s, a) => s + a.tickets, 0);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchS = !filterStatus || a.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Team Management</h1>
          <p className="text-[16px] text-on-surface-variant mt-1">Agent roster, workload distribution, and shift scheduling.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#dcfce7] px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-[13px] font-semibold text-[#166534]">
              {agents.filter((a) => a.status === "Active").length} Active
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg">
            <span className="text-[13px] text-on-surface-variant">{agents.length} Total Agents</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-outline-variant mb-6">
        {(["roster", "schedule", "distribution"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[14px] font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab === "distribution" ? "Workload Distribution" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "roster" && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents…"
                className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none focus:border-primary-container w-52" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-outline-variant rounded-lg text-[14px] bg-surface-container-lowest outline-none">
              <option value="">All Statuses</option>
              <option>Active</option>
              <option>Away</option>
              <option>Offline</option>
            </select>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Agent", "Role", "Status", "Shift", "Tickets Handled", isAdmin ? "Actions" : ""].filter(Boolean).map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((agent) => {
                  const sm = STATUS_META[agent.status];
                  const share = totalTickets > 0 ? Math.round((agent.tickets / totalTickets) * 100) : 0;
                  return (
                    <tr key={agent.email} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={agent.name} size={9} />
                          <div>
                            <p className="text-[14px] font-semibold text-on-surface">{agent.name}</p>
                            <p className="text-[12px] text-on-surface-variant">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                          agent.role === "Admin" ? "bg-primary-container/20 text-primary" : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {agent.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${sm.dot}`} />
                          <span className="text-[14px] text-on-surface">{sm.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${SHIFT_COLORS[agent.shift] ?? "bg-surface-container text-on-surface-variant"}`}>
                          {agent.shift.split(" ")[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary-container" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-[13px] text-on-surface">{agent.tickets}</span>
                          <span className="text-[11px] text-on-surface-variant">({share}%)</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                            </button>
                            <button className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Message">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">mail</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "schedule" && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-on-surface">Weekly Shift Planner</h2>
            <div className="flex gap-3">
              {SHIFTS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    i === 0 ? "bg-[#3b82f6]" : i === 1 ? "bg-[#f59e0b]" : "bg-[#8b5cf6]"
                  }`} />
                  <span className="text-[11px] text-on-surface-variant">{s.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider w-40">Agent</th>
                  {DAYS.map((d) => (
                    <th key={d} className="px-3 py-3 text-[11px] font-medium text-on-surface-variant uppercase tracking-wider text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {agents.map((agent) => {
                  const sched = SCHEDULE[agent.name] ?? Array(7).fill("");
                  return (
                    <tr key={agent.email} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={agent.name} size={7} />
                          <span className="text-[13px] font-medium text-on-surface truncate max-w-[100px]">{agent.name.split(" ")[0]}</span>
                        </div>
                      </td>
                      {sched.map((shift: string, di: number) => (
                        <td key={di} className="px-2 py-3 text-center">
                          {shift ? (
                            <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded-md ${SHIFT_COLORS[shift] ?? "bg-surface-container text-on-surface-variant"}`}>
                              {shift.split(" ")[0]}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant opacity-25 text-[18px]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="space-y-6">
          {/* Workload bars */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5">Ticket Workload Distribution</h2>
            <div className="space-y-4">
              {agents.sort((a, b) => b.tickets - a.tickets).map((agent, i) => {
                const share = totalTickets > 0 ? Math.round((agent.tickets / totalTickets) * 100) : 0;
                const BARCOLS = ["#d4af37","#735c00","#9a7f4e","#c49a2f","#e8c84a","#b8970a"];
                return (
                  <div key={agent.email} className="flex items-center gap-4">
                    <div className="w-32 shrink-0 flex items-center gap-2">
                      <Avatar name={agent.name} size={7} />
                      <span className="text-[13px] text-on-surface truncate">{agent.name.split(" ")[0]}</span>
                    </div>
                    <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${share}%`, backgroundColor: BARCOLS[i % BARCOLS.length] }} />
                    </div>
                    <div className="w-20 text-right shrink-0">
                      <span className="text-[13px] font-semibold text-on-surface">{agent.tickets}</span>
                      <span className="text-[11px] text-on-surface-variant ml-1">({share}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Agents", value: agents.length, icon: "group", color: "text-primary" },
              { label: "Active Now", value: agents.filter((a) => a.status === "Active").length, icon: "radio_button_checked", color: "text-[#166534]" },
              { label: "Total Tickets", value: totalTickets, icon: "confirmation_number", color: "text-[#1e40af]" },
              { label: "Avg per Agent", value: Math.round(totalTickets / Math.max(1, agents.length)), icon: "equalizer", color: "text-[#92400e]" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-[22px] font-bold text-on-surface">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shift coverage summary */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4">Shift Coverage Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHIFTS.map((shift, i) => {
                const shiftAgents = agents.filter((a) => a.shift === shift);
                const colors = ["border-[#3b82f6] bg-[#dbeafe]", "border-[#f59e0b] bg-[#fef3c7]", "border-[#8b5cf6] bg-[#ede9fe]"];
                const textColors = ["text-[#1e40af]", "text-[#92400e]", "text-[#5b21b6]"];
                return (
                  <div key={shift} className={`rounded-xl border-l-4 p-4 ${colors[i]}`}>
                    <p className={`text-[13px] font-semibold mb-1 ${textColors[i]}`}>{shift}</p>
                    <p className="text-[11px] text-on-surface-variant mb-3">{shiftAgents.length} agent{shiftAgents.length !== 1 ? "s" : ""} assigned</p>
                    <div className="space-y-1.5">
                      {shiftAgents.map((a) => (
                        <div key={a.email} className="flex items-center gap-2">
                          <Avatar name={a.name} size={5} />
                          <span className="text-[12px] text-on-surface">{a.name}</span>
                        </div>
                      ))}
                      {shiftAgents.length === 0 && (
                        <p className="text-[12px] text-on-surface-variant italic">No agents scheduled</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
