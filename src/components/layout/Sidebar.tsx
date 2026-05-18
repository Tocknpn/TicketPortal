'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/daily-tracking", icon: "dashboard",    label: "Daily Tracking" },
  { href: "/archive",        icon: "inventory_2",  label: "Archive"        },
  { href: "/reports/analytics", icon: "analytics", label: "Reports",
    children: [
      { href: "/reports/analytics", label: "Analytics"         },
      { href: "/reports/executive", label: "Executive Overview" },
    ]
  },
];

const adminNav = [
  { href: "/knowledge-base",   icon: "menu_book",      label: "Knowledge Base"   },
  { href: "/team-management",  icon: "groups",         label: "Team Management"  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "Admin";

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col p-4 z-50 bg-surface-container-lowest border-r border-outline-variant shadow-soft">
      {/* Brand */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
        </div>
        <div>
          <h1 className="text-[20px] font-bold leading-7 text-primary">Agent Portal</h1>
          <p className="text-[12px] font-medium text-on-surface-variant">Secure Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[14px] font-semibold leading-5 ${
                active(item.href)
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
            {item.children && active(item.href) && (
              <div className="ml-10 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`block px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                      pathname === child.href
                        ? "text-primary font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-outline-variant" />
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[14px] font-semibold leading-5 ${
                  active(item.href)
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
        <button
          onClick={() => router.push("/daily-tracking")}
          className="w-full mb-3 py-2.5 px-4 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Create New Ticket
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all text-[14px] font-semibold"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/logout" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all text-[14px] font-semibold"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
