import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReportData } from "@/lib/sheets";
import type { ReportStats } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const dateFrom = searchParams.get("dateFrom") ?? new Date().toISOString().slice(0, 10);
  const dateTo = searchParams.get("dateTo") ?? new Date().toISOString().slice(0, 10);
  const agents = searchParams.getAll("agent");
  const sources = searchParams.getAll("source");
  const types = searchParams.getAll("type");

  try {
    const rows = await getReportData({ dateFrom, dateTo, agents, sources, types });

    const stats: ReportStats = {
      total: rows.length,
      complete: rows.filter((r) => r.status === "Complete").length,
      pending: rows.filter((r) => r.status !== "Complete").length,
      avgHandleTime: rows.length
        ? parseFloat((rows.reduce((s, r) => s + r.handleTime, 0) / rows.length).toFixed(1))
        : 0,
      byType: {},
      bySource: {},
      byAgent: {},
    };

    for (const row of rows) {
      stats.byType[row.type] = (stats.byType[row.type] ?? 0) + 1;
      stats.bySource[row.source] = (stats.bySource[row.source] ?? 0) + 1;
      stats.byAgent[row.agent] = (stats.byAgent[row.agent] ?? 0) + 1;
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (e) {
    return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  }
}
