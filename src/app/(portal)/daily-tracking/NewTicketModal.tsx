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

  const inputCls = "w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-[14px] focus:border-primary outline-none transition-all";
  const labelCls = "block text-[12px] font-semibold text-on-surface-variant mb-1";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(25,28,30,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-xl shadow-overlay border border-outline-variant">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
          <div>
            <h3 className="text-[18px] font-semibold text-on-surface">New Ticket Creation</h3>
            <p className="text-[12px] text-on-surface-variant">Fill in the details to initialize a new customer service request.</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body — no scroll */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-error-container text-on-error-container text-sm px-4 py-2 rounded-lg">{error}</div>}

          {/* Row 1: Customer Name | Customer Phone | Source */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Customer Name *</label>
              <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                placeholder="Full legal name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Customer Phone</label>
              <input value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)}
                placeholder="Phone number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value)} className={inputCls}>
                {config.sources.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Type | Status | Start Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                {config.types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {config.statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => set("startTime", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Row 3: End Time (only active if Complete) | span 2 empty */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`${labelCls} ${!isComplete ? "opacity-50" : ""}`}>
                End Time {!isComplete && <span className="italic font-normal">(Locked)</span>}
              </label>
              {isComplete ? (
                <input type="datetime-local" value={form.endTime} onChange={(e) => set("endTime", e.target.value)}
                  className={inputCls} />
              ) : (
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 border border-outline-variant rounded-lg text-on-surface-variant opacity-50 text-[14px]">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  <span className="italic">Pending</span>
                </div>
              )}
            </div>
            {/* File upload spans 2 cols */}
            <div className="col-span-2">
              <label className={labelCls}>Supporting Document</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-outline-variant rounded-lg px-4 py-2 flex items-center gap-3 hover:bg-surface-container-low transition-colors cursor-pointer h-[38px]"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">cloud_upload</span>
                <span className="text-[13px] text-on-surface-variant truncate">
                  {file ? file.name : "Click to upload (image / PDF, max 10MB)"}
                </span>
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {/* Row 4: Issue Description | Resolution (2 col each) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Issue Description</label>
              <textarea value={form.details} onChange={(e) => set("details", e.target.value)}
                rows={3} placeholder="Describe the customer request or issue…"
                className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Resolution</label>
              <textarea value={form.resolution} onChange={(e) => set("resolution", e.target.value)}
                rows={3} placeholder="Resolution notes…"
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="bg-primary text-on-primary px-7 py-2 text-[14px] font-semibold rounded-lg shadow-soft hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
              {saving ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving…</> : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
