import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <div className="flex h-full bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 ml-64">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
