'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Ticket } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const agentEmail = session?.user?.email ?? "";
  const canEdit = ticket ? (isAdmin || ticket.agentEmail === agentEmail) : false;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTicket(d.data); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!ticket) return;
    setDeleting(true);
    const res = await fetch(`/api/tickets/${ticket.uid}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/daily-tracking");
    else { setDeleting(false); setShowDeleteConfirm(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-4">search_off</span>
        <h2 className="text-[20px] font-semibold text-on-surface mb-2">Ticket Not Found</h2>
        <p className="text-[14px] text-on-surface-variant mb-6">The ticket ID "{id}" does not exist or was deleted.</p>
        <button onClick={() => router.push("/daily-tracking")}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusMeta: Record<string, { color: string; bg: string; icon: string }> = {
    Complete:    { color: "#166534", bg: "#dcfce7", icon: "check_circle" },
    "In Progress": { color: "#92400e", bg: "#fef3c7", icon: "pending" },
    Pending:     { color: "#1e40af", bg: "#dbeafe", icon: "schedule" },
  };
  const sm = statusMeta[ticket.status] ?? statusMeta.Pending;

  const auditEvents = [
    { time: ticket.createdAt || ticket.startTime, icon: "confirmation_number", color: "text-primary", label: "Ticket Created", desc: `Created by ${ticket.agentName}` },
    { time: ticket.startTime, icon: "play_circle", color: "text-info", label: "Service Started", desc: `Agent ${ticket.agentName} began handling the request` },
    ...(ticket.attachmentUrl ? [{ time: ticket.startTime, icon: "attach_file", color: "text-secondary", label: "Attachment Added", desc: "Supporting document uploaded" }] : []),
    ...(ticket.endTime ? [{ time: ticket.endTime, icon: "check_circle", color: "text-success", label: "Ticket Resolved", desc: ticket.resolution || "Resolution recorded" }] : []),
  ].filter(e => e.time);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-on-surface-variant mb-6">
        <button onClick={() => router.push("/daily-tracking")} className="hover:text-primary transition-colors">Daily Management</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{ticket.uid}</span>
      </div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[28px] font-semibold text-on-surface">{ticket.uid}</h1>
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold"
              style={{ color: sm.color, backgroundColor: sm.bg }}
            >
              <span className="material-symbols-outlined text-[16px]">{sm.icon}</span>
              {ticket.status}
            </span>
          </div>
          <p className="text-[14px] text-on-surface-variant">
            Opened {formatDateTime(ticket.startTime)} · {ticket.source} · {ticket.type}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-error/40 text-error rounded-lg text-[14px] font-semibold hover:bg-error/5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
            )}
            <button
              onClick={() => router.push(`/tickets/${ticket.uid}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit This Ticket
            </button>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — ticket details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Info */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
              Customer Information
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <Avatar name={ticket.customerName} size={12} />
              <div>
                <p className="text-[20px] font-semibold text-on-surface">{ticket.customerName}</p>
                <p className="text-[14px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  {ticket.customerPhone || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Source Channel", value: ticket.source, icon: "cell_tower" },
                { label: "Ticket Type", value: ticket.type, icon: "category" },
                { label: "Assigned Agent", value: ticket.agentName, icon: "badge" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-surface-container-low rounded-lg p-3">
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
                  </p>
                  <p className="text-[14px] font-semibold text-on-surface">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time tracking */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
              Time Tracking
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Start Time</p>
                <p className="text-[14px] font-semibold text-on-surface">{ticket.startTime ? formatDateTime(ticket.startTime) : "—"}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">End Time</p>
                <p className="text-[14px] font-semibold text-on-surface">{ticket.endTime ? formatDateTime(ticket.endTime) : "—"}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Handle Time</p>
                <p className="text-[14px] font-semibold text-on-surface">{formatDuration(ticket.handleTime)}</p>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          {ticket.details && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">description</span>
                Issue Description
              </h2>
              <p className="text-[15px] text-on-surface leading-7 whitespace-pre-wrap">{ticket.details}</p>
            </div>
          )}

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-success">check_circle</span>
                Resolution Summary
              </h2>
              <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                <p className="text-[15px] text-on-surface leading-7 whitespace-pre-wrap">{ticket.resolution}</p>
              </div>
            </div>
          )}

          {/* Attachment */}
          {ticket.attachmentUrl && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">attach_file</span>
                Supporting Documents
              </h2>
              <a
                href={ticket.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">insert_drive_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface truncate">Attached Document</p>
                  <p className="text-[12px] text-on-surface-variant">Click to open in new tab</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Right — audit trail */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
              Audit Trail
            </h2>
            <div className="relative">
              {auditEvents.length === 0 ? (
                <p className="text-[13px] text-on-surface-variant text-center py-4">No events recorded.</p>
              ) : (
                <div className="space-y-0">
                  {auditEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3 pb-6 last:pb-0 relative">
                      {i < auditEvents.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-outline-variant" />
                      )}
                      <div className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10 ${ev.color}`}>
                        <span className="material-symbols-outlined text-[16px]">{ev.icon}</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[13px] font-semibold text-on-surface">{ev.label}</p>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">{ev.desc}</p>
                        <p className="text-[11px] text-on-surface-variant mt-1 opacity-70">{formatDateTime(ev.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket metadata card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
            <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">info</span>
              Ticket Metadata
            </h2>
            <div className="space-y-3 text-[13px]">
              {[
                { label: "Ticket UID", value: ticket.uid },
                { label: "Agent Email", value: ticket.agentEmail },
                { label: "Created", value: formatDateTime(ticket.createdAt || ticket.startTime) },
                { label: "Last Updated", value: ticket.endTime ? formatDateTime(ticket.endTime) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="text-on-surface font-medium text-right truncate max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          {canEdit && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">bolt</span>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/tickets/${ticket.uid}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary-container/10 hover:bg-primary-container/20 rounded-lg text-[14px] font-semibold text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
                  Edit Ticket
                </button>
                {ticket.attachmentUrl && (
                  <a
                    href={ticket.attachmentUrl} target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-[14px] font-semibold text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">download</span>
                    View Attachment
                  </a>
                )}
                <button
                  onClick={() => router.push("/daily-tracking")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container rounded-lg text-[14px] text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(25,28,30,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-surface-container-lowest rounded-xl shadow-overlay border border-outline-variant w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface">Delete Ticket</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-6 mb-6">
              Permanently delete <span className="font-semibold text-on-surface">{ticket.uid}</span>? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2.5 text-[14px] font-semibold bg-error text-on-error rounded-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2">
                {deleting ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Deleting…</> : "Delete Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
