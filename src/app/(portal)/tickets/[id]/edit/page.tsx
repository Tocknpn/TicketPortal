'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Ticket, AppConfig } from "@/lib/types";
import { nowLocalISO, formatDateTime } from "@/lib/utils";

export default function EditTicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [config, setConfig] = useState<AppConfig>({ sources: [], types: [], statuses: [], agents: [] });
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", source: "", type: "",
    status: "", details: "", resolution: "", startTime: "", endTime: "",
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const agentEmail = session?.user?.email ?? "";

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/tickets/${id}`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([tData, cData]) => {
      if (tData.success) {
        const t: Ticket = tData.data;
        setTicket(t);
        setForm({
          customerName: t.customerName,
          customerPhone: t.customerPhone,
          source: t.source,
          type: t.type,
          status: t.status,
          details: t.details,
          resolution: t.resolution,
          startTime: t.startTime ?? "",
          endTime: t.endTime ?? "",
        });
      }
      if (cData.success) setConfig(cData.data);
      setLoading(false);
    });
  }, [id]);

  const canEdit = ticket ? (isAdmin || ticket.agentEmail === agentEmail) : false;
  const isComplete = form.status === "Complete";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName) { setError("Customer name required."); return; }
    setSaving(true); setError("");

    let attachmentUrl = ticket?.attachmentUrl ?? "";
    if (newFile) {
      setUploading(true);
      const fd = new FormData(); fd.append("file", newFile);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json();
      setUploading(false);
      if (!upData.success) { setError("File upload failed: " + upData.message); setSaving(false); return; }
      attachmentUrl = upData.data.url;
    }

    const endTime = isComplete && !form.endTime ? nowLocalISO() : form.endTime;

    const res = await fetch(`/api/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, endTime, attachmentUrl }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) router.push(`/tickets/${id}`);
    else setError(data.message ?? "Save failed.");
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading ticket…
      </div>
    );
  }

  if (!ticket || !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-4">lock</span>
        <h2 className="text-[20px] font-semibold text-on-surface mb-2">Access Denied</h2>
        <p className="text-[14px] text-on-surface-variant mb-6">You don't have permission to edit this ticket.</p>
        <button onClick={() => router.push(`/tickets/${id}`)}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold">
          View Ticket
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-on-surface-variant mb-6">
        <button onClick={() => router.push("/daily-tracking")} className="hover:text-primary transition-colors">Daily Management</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <button onClick={() => router.push(`/tickets/${id}`)} className="hover:text-primary transition-colors">{ticket.uid}</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Edit</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-on-surface">Edit Ticket</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Modify details for {ticket.uid} · Created {formatDateTime(ticket.startTime)}</p>
        </div>
        <button onClick={() => router.push(`/tickets/${id}`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-lg text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-error-container text-on-error-container text-[14px] px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Customer Name *</label>
                  <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                    placeholder="Full legal name"
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Phone Number</label>
                  <input value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">category</span>
                Ticket Classification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Source Channel</label>
                  <select value={form.source} onChange={(e) => set("source", e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all">
                    {config.sources.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Ticket Type</label>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all">
                    {config.types.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all">
                    {config.statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Time tracking */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
                Time Tracking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Start Time</label>
                  <input type="datetime-local" value={form.startTime} onChange={(e) => set("startTime", e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className={`block text-[13px] font-semibold mb-2 ${isComplete ? "text-on-surface-variant" : "text-on-surface-variant opacity-50"}`}>
                    End Time {!isComplete && "(Locked — set status to Complete)"}
                  </label>
                  {isComplete ? (
                    <input type="datetime-local" value={form.endTime} onChange={(e) => set("endTime", e.target.value)}
                      className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none" />
                  ) : (
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant opacity-50">
                      <span className="material-symbols-outlined text-[18px]">block</span>
                      <span className="text-[15px] italic">Pending Resolution</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Resolution */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6 space-y-5">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">description</span>
                Issue Details
              </h2>
              <div>
                <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Issue Description</label>
                <textarea value={form.details} onChange={(e) => set("details", e.target.value)}
                  rows={5} placeholder="Describe the customer's request or reported issue…"
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Resolution Notes</label>
                <textarea value={form.resolution} onChange={(e) => set("resolution", e.target.value)}
                  rows={3} placeholder="How was this ticket resolved?"
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all resize-none" />
              </div>
            </div>

            {/* Attachment */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">attach_file</span>
                Supporting Documents
              </h2>

              {ticket.attachmentUrl && !newFile && (
                <div className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]">insert_drive_file</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-on-surface">Current attachment</p>
                    <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer"
                      className="text-[12px] text-primary hover:underline">View file</a>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Upload new to replace</span>
                </div>
              )}

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">cloud_upload</span>
                </div>
                {newFile ? (
                  <p className="text-[14px] font-semibold text-on-surface">{newFile.name}</p>
                ) : (
                  <>
                    <p className="text-[14px] font-semibold text-on-surface">Click to upload replacement</p>
                    <p className="text-[12px] text-on-surface-variant">Images or PDF (Max 10MB)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save actions */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4">Save Changes</h2>
              <button type="submit" disabled={saving || uploading}
                className="w-full bg-primary text-on-primary py-3 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-3">
                {saving || uploading
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>{uploading ? "Uploading…" : "Saving…"}</>
                  : <><span className="material-symbols-outlined text-[18px]">save</span>Save Changes</>
                }
              </button>
              <button type="button" onClick={() => router.push(`/tickets/${id}`)}
                className="w-full py-2.5 rounded-lg text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all">
                Discard
              </button>
            </div>

            {/* Status guide */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4">Status Guide</h2>
              <div className="space-y-3">
                {[
                  { status: "Pending", icon: "schedule", color: "text-[#1e40af]", bg: "bg-[#dbeafe]", desc: "Awaiting action" },
                  { status: "In Progress", icon: "pending", color: "text-[#92400e]", bg: "bg-[#fef3c7]", desc: "Being handled" },
                  { status: "Complete", icon: "check_circle", color: "text-[#166534]", bg: "bg-[#dcfce7]", desc: "Fully resolved" },
                ].map(({ status, icon, color, bg, desc }) => (
                  <div key={status} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${form.status === status ? bg : ""}`}>
                    <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                    <div>
                      <p className={`text-[13px] font-semibold ${form.status === status ? color : "text-on-surface"}`}>{status}</p>
                      <p className="text-[11px] text-on-surface-variant">{desc}</p>
                    </div>
                    {form.status === status && <span className="material-symbols-outlined text-[16px] text-on-surface-variant ml-auto">check</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket info (read only) */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-4">Ticket Info</h2>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">UID</span>
                  <span className="font-semibold text-primary">{ticket.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Agent</span>
                  <span className="font-medium text-on-surface">{ticket.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Created</span>
                  <span className="font-medium text-on-surface">{formatDateTime(ticket.startTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
