'use client';
import { useState } from "react";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"profile"|"system"|"security">("profile");
  const [saved, setSaved] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === "Admin";

  function fakeSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-on-surface">Settings</h1>
        <p className="text-[16px] text-on-surface-variant mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4">
            {/* Profile preview */}
            <div className="flex flex-col items-center py-4 border-b border-outline-variant mb-4">
              <Avatar name={session?.user?.name ?? "User"} size={14} />
              <p className="mt-3 text-[14px] font-semibold text-on-surface">{session?.user?.name ?? "—"}</p>
              <p className="text-[12px] text-on-surface-variant">{session?.user?.email ?? "—"}</p>
              <span className={`mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isAdmin ? "bg-primary-container/20 text-primary" : "bg-surface-container text-on-surface-variant"
              }`}>
                {isAdmin ? "Admin" : "Standard Agent"}
              </span>
            </div>

            <div className="space-y-1">
              {(["profile","system","security"] as const).map((tab) => {
                const icons: Record<string, string> = { profile: "person", system: "settings", security: "lock" };
                const labels: Record<string, string> = { profile: "Profile", system: "System", security: "Security" };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors text-left ${
                      activeTab === tab
                        ? "bg-primary-container/20 text-on-surface font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icons[tab]}</span>
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {saved && (
            <div className="bg-[#dcfce7] text-[#166534] border border-[#86efac] rounded-lg px-4 py-3 text-[14px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Settings saved successfully.
            </div>
          )}

          {activeTab === "profile" && (
            <>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
                <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                  Profile Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Display Name</label>
                    <input defaultValue={session?.user?.name ?? ""}
                      className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Email Address</label>
                    <input defaultValue={session?.user?.email ?? ""} disabled
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] text-on-surface-variant outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Role</label>
                    <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">badge</span>
                      <span className="text-[15px] text-on-surface">{isAdmin ? "Admin / Manager" : "Standard Agent"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Timezone</label>
                    <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
                      <span className="text-[15px] text-on-surface">GMT+7 (Asia/Bangkok)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
                <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications</span>
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "New ticket assigned to me", desc: "Receive alerts when a ticket is assigned", defaultOn: true },
                    { label: "Ticket status updates", desc: "Notify when a ticket I own changes status", defaultOn: true },
                    { label: "System announcements", desc: "Important platform updates from management", defaultOn: false },
                  ].map(({ label, desc, defaultOn }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-[14px] font-semibold text-on-surface">{label}</p>
                        <p className="text-[12px] text-on-surface-variant">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
                        <div className="w-10 h-5.5 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "system" && (
            <>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
                <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">palette</span>
                  Display Preferences
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-3">Default Table Rows</label>
                    <div className="flex gap-2">
                      {[25, 50, 100].map((n) => (
                        <button key={n}
                          className={`px-5 py-2 rounded-lg text-[14px] font-semibold border transition-all ${n === 50 ? "border-primary-container bg-primary-container/10 text-primary" : "border-outline-variant hover:bg-surface-container-high"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface-variant mb-3">Date Format</label>
                    <div className="flex gap-2 flex-wrap">
                      {["DD/MM/YYYY HH:mm", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => (
                        <button key={f}
                          className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all ${f === "DD/MM/YYYY HH:mm" ? "border-primary-container bg-primary-container/10 text-primary" : "border-outline-variant hover:bg-surface-container-high"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
                  <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">admin_panel_settings</span>
                    Admin Tools
                  </h2>
                  <p className="text-[13px] text-on-surface-variant mb-5">These tools are only visible to administrators.</p>
                  <div className="space-y-3">
                    <a href="/api/migrate/hash-passwords"
                      className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#92400e] text-[18px]">key</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-on-surface">Migrate Passwords to bcrypt</p>
                          <p className="text-[12px] text-on-surface-variant">One-time migration of plain-text passwords in User_Database sheet</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "security" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-6">
              <h2 className="text-[14px] font-semibold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
                Security Settings
              </h2>
              <div className="space-y-5">
                <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                  <div>
                    <p className="text-[14px] font-semibold text-on-surface">Password Security</p>
                    <p className="text-[13px] text-on-surface-variant mt-0.5">Passwords are hashed with bcrypt (cost factor 10). Contact your administrator to reset your password.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface-variant mb-2">Session Timeout</label>
                  <select className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] focus:border-primary outline-none">
                    <option>8 hours (recommended)</option>
                    <option>4 hours</option>
                    <option>24 hours</option>
                  </select>
                </div>
                <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#dc2626] mt-0.5">warning</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#991b1b]">Access Audit</p>
                    <p className="text-[13px] text-[#b91c1c] mt-0.5">All login events and administrative actions are logged for compliance. Contact IT if you notice unexpected access.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={fakeSave}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
