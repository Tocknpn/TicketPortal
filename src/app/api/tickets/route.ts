import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentTickets, searchTickets, createTicket } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("mode"); // "recent" | "search"

  try {
    if (mode === "search") {
      const results = await searchTickets({
        query: searchParams.get("q") ?? undefined,
        dateFrom: searchParams.get("dateFrom") ?? undefined,
        dateTo: searchParams.get("dateTo") ?? undefined,
        agent: searchParams.get("agent") ?? undefined,
        source: searchParams.get("source") ?? undefined,
        type: searchParams.get("type") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      });
      return NextResponse.json({ success: true, data: results });
    }
    const tickets = await getRecentTickets(30);
    return NextResponse.json({ success: true, data: tickets });
  } catch (e) {
    return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const uid = await createTicket(body);
    return NextResponse.json({ success: true, data: { uid } });
  } catch (e) {
    return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  }
}
