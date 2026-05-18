import { google } from "googleapis";
import type { Ticket, AppConfig, TicketSummaryRow, AgentUser } from "./types";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const MASTER_TAB = "Master_Data";
const USER_TAB = "User_Database";
const CONFIG_TAB = "Setting_Config";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

/* ── Read helpers ── */

function rowToTicket(row: string[]): Ticket {
  return {
    uid: row[0] ?? "",
    createdAt: row[1] ?? "",
    agentEmail: row[2] ?? "",
    agentName: row[3] ?? "",
    source: row[4] ?? "",
    customerName: row[5] ?? "",
    customerPhone: row[6] ?? "",
    type: row[7] ?? "",
    status: (row[8] ?? "Pending") as Ticket["status"],
    details: row[9] ?? "",
    resolution: row[10] ?? "",
    startTime: row[11] ?? "",
    endTime: row[12] || null,
    handleTime: parseFloat(row[13]) || 0,
    attachmentUrl: row[14] ?? "",
  };
}

/* ── Config ── */

export async function getAppConfig(): Promise<AppConfig> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONFIG_TAB}!A2:D`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  return {
    sources: rows.map((r) => r[0]).filter(Boolean),
    types: rows.map((r) => r[1]).filter(Boolean),
    statuses: rows.map((r) => r[2]).filter(Boolean),
    agents: rows.map((r) => r[3]).filter(Boolean),
  };
}

/* ── Auth ── */


export async function getAllUsers(): Promise<AgentUser[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${USER_TAB}!A2:D`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  return rows.map((r) => ({ name: r[0], email: r[1], password: r[2], role: r[3] as AgentUser["role"] }));
}

/* ── Tickets ── */

export async function getRecentTickets(days = 30): Promise<Ticket[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A2:O`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return rows
    .filter((r) => r[1] && new Date(r[1]) >= cutoff)
    .map(rowToTicket)
    .reverse();
}

export async function searchTickets(filters: {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  agent?: string;
  source?: string;
  type?: string;
  status?: string;
}): Promise<Ticket[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A2:O`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  const q = filters.query?.toLowerCase().trim();
  const from = filters.dateFrom ? new Date(filters.dateFrom + "T00:00:00") : null;
  const to = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null;

  return rows
    .filter((row) => {
      const rowDate = new Date(row[1]);
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      if (q) {
        const hit =
          row[0].toLowerCase().includes(q) ||
          row[5].toLowerCase().includes(q) ||
          row[6].toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filters.agent && row[3] !== filters.agent) return false;
      if (filters.source && row[4] !== filters.source) return false;
      if (filters.type && row[7] !== filters.type) return false;
      if (filters.status && row[8] !== filters.status) return false;
      return true;
    })
    .map(rowToTicket)
    .reverse();
}

export async function getTicketByUid(uid: string): Promise<Ticket | null> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A2:O`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  const row = rows.find((r) => r[0] === uid);
  return row ? rowToTicket(row) : null;
}

export async function createTicket(data: Omit<Ticket, "uid" | "createdAt" | "handleTime">): Promise<string> {
  const sheets = await getSheets();
  const now = new Date();
  const uid = "TK-" + now.getTime();
  const start = data.startTime ? new Date(data.startTime) : now;
  const end = data.endTime ? new Date(data.endTime) : null;
  const handleTime = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A:O`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        uid, now.toISOString(), data.agentEmail, data.agentName,
        data.source, data.customerName, data.customerPhone,
        data.type, data.status, data.details, data.resolution,
        data.startTime, data.endTime ?? "", handleTime, data.attachmentUrl,
      ]],
    },
  });
  return uid;
}

export async function updateTicket(uid: string, data: Partial<Ticket>): Promise<void> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A:A`,
  });
  const uids = ((res.data.values as string[][]) ?? []).map((r) => r[0]);
  const rowIndex = uids.indexOf(uid);
  if (rowIndex === -1) throw new Error("Ticket not found");
  const row = rowIndex + 1;

  const start = data.startTime ? new Date(data.startTime) : null;
  const end = data.endTime ? new Date(data.endTime) : null;
  const handleTime = start && end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!E${row}:O${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.source, data.customerName, data.customerPhone,
        data.type, data.status, data.details, data.resolution,
        data.startTime ?? "", data.endTime ?? "", handleTime,
        data.attachmentUrl ?? "",
      ]],
    },
  });
}

export async function deleteTicket(uid: string): Promise<void> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A:A`,
  });
  const uids = ((res.data.values as string[][]) ?? []).map((r) => r[0]);
  const rowIndex = uids.indexOf(uid);
  if (rowIndex === -1) throw new Error("Ticket not found");

  // Get sheet ID for batchUpdate
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === MASTER_TAB);
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    },
  });
}

/* ── Reports ── */

export async function getReportData(filters: {
  dateFrom: string;
  dateTo: string;
  agents?: string[];
  sources?: string[];
  types?: string[];
}): Promise<TicketSummaryRow[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MASTER_TAB}!A2:O`,
  });
  const rows = (res.data.values as string[][]) ?? [];
  const from = new Date(filters.dateFrom + "T00:00:00");
  const to = new Date(filters.dateTo + "T23:59:59");

  return rows
    .filter((row) => {
      const d = new Date(row[11]);
      if (d < from || d > to) return false;
      if (filters.agents?.length && !filters.agents.includes(row[3])) return false;
      if (filters.sources?.length && !filters.sources.includes(row[4])) return false;
      if (filters.types?.length && !filters.types.includes(row[7])) return false;
      return true;
    })
    .map((row) => ({
      agent: row[3],
      source: row[4],
      type: row[7],
      status: row[8],
      handleTime: parseFloat(row[13]) || 0,
    }));
}
