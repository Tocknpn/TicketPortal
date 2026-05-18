import Link from "next/link";

export default function LogoutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="mb-3 flex items-center justify-center w-16 h-16 bg-primary-container rounded-xl shadow-soft">
          <span className="material-symbols-outlined text-[40px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        </div>
        <h1 className="text-[20px] font-bold text-primary">Easy Gold Portal</h1>
        <p className="text-[12px] text-on-surface-variant mt-1 uppercase tracking-wider font-medium">Agent Secure Access</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[32px] text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-[24px] font-bold text-on-surface mb-3">Successfully Logged Out</h2>
        <p className="text-[14px] text-on-surface-variant leading-6 mb-6">
          Your session has been securely terminated. Thank you for maintaining data integrity.
        </p>

        <div className="border-t border-outline-variant pt-5 mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Session Duration</p>
            <p className="text-[20px] font-bold text-on-surface">—</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">Tickets Resolved</p>
            <p className="text-[20px] font-bold text-on-surface">—</p>
          </div>
        </div>

        <Link
          href="/login"
          className="w-full h-11 bg-primary-container text-on-primary-container text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          Return to Login
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          AES-256 Multi-Layer Encryption Active
        </p>
        <div className="flex gap-6 text-[12px] text-secondary">
          <span>Privacy Policy</span>
          <span>Contact Support</span>
          <span>Security Audit</span>
        </div>
      </div>
    </main>
  );
}
