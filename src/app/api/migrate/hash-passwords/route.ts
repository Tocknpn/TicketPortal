import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import bcrypt from "bcryptjs";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// One-time migration: hashes plain-text passwords in User_Database col C.
// Admin only. Call GET /api/migrate/hash-passwords once, then delete this file.
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "Admin") {
    return NextResponse.json({ success: false, message: "Admin only" }, { status: 403 });
  }

  const authClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth: authClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "User_Database!A2:D",
  });

  const rows = (res.data.values as string[][]) ?? [];
  let migrated = 0;

  for (let i = 0; i < rows.length; i++) {
    const password = rows[i][2];
    if (!password || password.startsWith("$2b$")) continue;
    const hashed = await bcrypt.hash(password, 12);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `User_Database!C${i + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [[hashed]] },
    });
    migrated++;
  }

  return NextResponse.json({ success: true, data: { migrated, total: rows.length } });
}
