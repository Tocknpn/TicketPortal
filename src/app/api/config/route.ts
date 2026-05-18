import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/sheets";

export async function GET() {
  try {
    const config = await getAppConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (e) {
    return NextResponse.json({ success: false, message: String(e) }, { status: 500 });
  }
}
