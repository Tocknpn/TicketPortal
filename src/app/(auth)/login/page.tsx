'use client';
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) { setError("Username and password required."); return; }
    setLoading(true); setError("");
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.ok) { router.push("/daily-tracking"); }
    else { setError("Invalid username or password."); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-container rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-secondary-container rounded-full blur-[120px]" />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(#d0c5af 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft p-8 md:p-10">
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <div className="mb-4 flex items-center justify-center w-16 h-16 bg-primary-container rounded-lg shadow-soft">
              <span className="material-symbols-outlined text-[40px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
            </div>
            <h1 className="text-[28px] font-semibold leading-9 text-primary text-center">Easy Gold Portal</h1>
            <p className="text-[14px] text-on-surface-variant mt-2 text-center">Secure Agent Access &amp; Asset Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your agent ID"
                className="w-full h-12 px-4 bg-surface-container-lowest border border-outline rounded-lg text-[16px] focus:border-primary-container outline-none transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-surface-container-lowest border border-outline rounded-lg text-[16px] focus:border-primary-container outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">{showPw ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline accent-primary-container cursor-pointer" />
              <label htmlFor="remember" className="text-[14px] text-on-surface-variant cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-container text-on-primary-container text-[14px] font-semibold rounded-lg shadow-soft hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Signing in…
                </>
              ) : (
                <>
                  SIGN IN
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col items-center gap-3">
            <p className="text-[12px] text-on-surface-variant text-center">Securely monitored connection. Authorized personnel only.</p>
            <div className="flex gap-6">
              <span className="text-[12px] text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">help</span>
                Help Center
              </span>
              <span className="text-[12px] text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">security</span>
                Security Protocol
              </span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-[12px] text-on-surface-variant opacity-60">
          © 2024 Easy Gold Financial Services. v1.0.0
        </p>
      </div>

      {/* Right decorative panel (xl screens) */}
      <div className="hidden xl:flex fixed right-0 top-0 h-full w-[30%] pointer-events-none flex-col items-center justify-center p-12 gap-8 bg-surface-container-low border-l border-outline-variant">
        <div className="w-full aspect-square max-w-sm rounded-2xl overflow-hidden shadow-soft border border-outline-variant bg-surface flex items-center justify-center">
          <span className="material-symbols-outlined text-[120px] text-primary-container opacity-60" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-[20px] font-semibold text-primary">Advanced Protection</h3>
          <p className="text-[14px] text-on-surface-variant max-w-xs">Our enterprise-grade encryption ensures your gold assets and transactions remain strictly confidential and tamper-proof.</p>
        </div>
      </div>
    </main>
  );
}
