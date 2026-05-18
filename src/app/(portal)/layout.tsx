export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-surface">
      {/* Sidebar placeholder */}
      <aside className="w-[256px] shrink-0 bg-surface-white border-r border-outline-variant" />
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar placeholder */}
        <header className="h-14 border-b border-outline-variant bg-surface-white" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
