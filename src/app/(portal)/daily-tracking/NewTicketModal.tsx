'use client';
import { useState, useRef } from "react";
import type { AppConfig } from "@/lib/types";
import { nowLocalISO } from "@/lib/utils";

interface Props {
  config: AppConfig;
  agentEmail: string;
  agentName: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewTicketModal({ config, agentEmail, agentName, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", source: config.sources[0] ?? "",
    type: config.types[0] ?? "", status: config.statuses[0] ?? "Pending",
    details: "", resolution: "", startTime: nowLocalISO(), endTime: "",
  });
  const [file, setFile]           = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isComplete = form.status === "Complete";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName) { setError("Customer name required."); return; }
    setSaving(true); setError("");

    let attachmentUrl = "";
    if (file) {
      setUploading(true);
      const fd = new FormData(); fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json();
      setUploading(false);
      if (!upData.success) { setError("File upload failed: " + upData.message); setSaving(false); return; }
      attachmentUrl = upData.data.url;
    }

    const endTime = isComplete && !form.endTime ? nowLocalISO() : form.endTime;

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, endTime, agentEmail, agentName, attachmentUrl }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { onCreated(); }
    else { setError(data.message); }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(25,28,30,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-overlay overflow-hidden border border-outline-variant">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h3 className="text-[20px] font-semibold text-on-surface">New Ticket Creation</h3>
            <p className="text-[12px] text-on-surface-variant">Fill in the details to initialize a new customer service request.</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Customer Name *</label>
              <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                placeholder="Full legal name"
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Customer Phone</label>
              <input value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)}
                placeholder="Phone number"
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all">
                {config.sources.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all">
                {config.types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all">
                {config.statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Start Time (Auto-filled)</label>
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span className="text-[16px]">{form.startTime.replace("T", " ")}</span>
              </div>
            </div>
            <div>
              <label className={`block text-[14px] font-semibold mb-2 ${isComplete ? "text-on-surface-variant" : "text-on-surface-variant opacity-50"}`}>
                End Time {isComplete ? "" : "(Locked)"}
              </label>
              {isComplete ? (
                <input type="datetime-local" value={form.endTime} onChange={(e) => set("endTime", e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none" />
              ) : (
                <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant opacity-50">
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  <span className="text-[16px] italic">Pending Resolution</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Issue Description</label>
            <textarea value={form.details} onChange={(e) => set("details", e.target.value)}
              rows={4} placeholder="Detailed description of the customer request or reported issue…"
              className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all resize-none" />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Resolution</label>
            <textarea value={form.resolution} onChange={(e) => set("resolution", e.target.value)}
              rows={2} placeholder="Resolution notes…"
              className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[16px] focus:border-primary outline-none transition-all resize-none" />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[14px] font-semibold text-on-surface-variant mb-2">Supporting Documents</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
              </div>
              {file ? (
                <p className="text-[14px] font-semibold text-on-surface">{file.name}</p>
              ) : (
                <>
                  <p className="text-[14px] font-semibold text-on-surface">Click to upload or drag and drop</p>
                  <p className="text-[12px] text-on-surface-variant">Screenshots or PDFs (Max 10MB)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="bg-primary text-on-primary px-8 py-2.5 text-[14px] font-semibold rounded-lg shadow-soft hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
              {saving ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving…</> : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
