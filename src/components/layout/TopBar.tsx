'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/archive?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "AG";

  return (
    <header className="sticky top-0 w-full z-40 flex justify-between items-center px-8 bg-surface border-b border-outline-variant h-16 shadow-soft">
      <h2 className="text-[20px] font-bold text-primary">Easy Gold Portal</h2>

      <div className="flex items-center gap-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-[14px] focus:border-primary-container outline-none"
            placeholder="Search tickets..."
          />
        </form>

        <div className="flex items-center gap-3 text-on-surface-variant">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold border border-outline-variant">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
