import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const TZ = "Asia/Bangkok"; // GMT+7

export function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { timeZone: TZ });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(minutes: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function nowLocalISO(): string {
  const now = new Date();
  const offset = 7 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset).toISOString().slice(0, 16);
}

export function statusColor(status: string): string {
  switch (status) {
    case "Complete": return "text-success bg-success-bg";
    case "In Progress": return "text-info bg-info-bg";
    default: return "text-warning bg-warning-bg";
  }
}
