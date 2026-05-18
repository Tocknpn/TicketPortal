import { NextResponse } from "next/server";
import { getAllUsers, getAppConfig } from "@/lib/sheets";

// Temp debug endpoint — remove after connection confirmed working
export async function GET() {
  const result: Record<string, unknown> = {
    env: {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "NOT SET",
      GOOGLE_PRIVATE_KEY_SET: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_PRIVATE_KEY_STARTS: process.env.GOOGLE_PRIVATE_KEY?.slice(0, 40) ?? "NOT SET",
      GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID ?? "NOT SET",
      DEV_MODE: !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY,
    },
  };

  try {
    const users = await getAllUsers();
    result.users = {
      count: users.length,
      // return usernames only — no passwords
      usernames: users.map((u) => u.email),
    };
    result.usersOk = true;
  } catch (e) {
    result.usersOk = false;
    result.usersError = String(e);
  }

  try {
    const config = await getAppConfig();
    result.config = config;
    result.configOk = true;
  } catch (e) {
    result.configOk = false;
    result.configError = String(e);
  }

  return NextResponse.json(result);
}
