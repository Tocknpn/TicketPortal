import { Suspense } from "react";
import DailyTrackingClient from "./DailyTrackingClient";

export default function DailyTrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Loading…
      </div>
    }>
      <DailyTrackingClient />
    </Suspense>
  );
}
