import { google } from "googleapis";

const SHEET_RANGE = "Anmälningar!A:H"; // flik-namn + kolumner

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel env vars can't contain real newlines easily, so the key is
  // stored with literal \n and unescaped here.
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Saknar GOOGLE_SERVICE_ACCOUNT_EMAIL eller GOOGLE_PRIVATE_KEY i miljövariablerna."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

/**
 * Lägger till en ny rad med en anmälan i Google Sheet.
 */
export async function appendRegistration(entry) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Saknar GOOGLE_SHEET_ID i miljövariablerna.");

  const sheets = getSheetsClient();
  const row = [
    new Date().toISOString(),
    entry.name,
    entry.email,
    entry.phone || "",
    entry.group,
    entry.partySize,
    entry.allergies || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/**
 * Hämtar alla anmälningar från Google Sheet (för admin-sidan).
 * Förutsätter att rad 1 är en rubrikrad och datan börjar på rad 2.
 */
export async function getParticipants() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Saknar GOOGLE_SHEET_ID i miljövariablerna.");

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: SHEET_RANGE,
  });

  const rows = res.data.values || [];
  // Hoppa över ev. rubrikrad om första cellen inte ser ut som ett ISO-datum
  const dataRows = rows.filter((r) => r.length > 0 && /^\d{4}-\d{2}-\d{2}T/.test(r[0]));

  return dataRows.map((r) => ({
    timestamp: r[0] ? new Date(r[0]).toLocaleString("sv-FI") : "",
    name: r[1] || "",
    email: r[2] || "",
    phone: r[3] || "",
    group: r[4] || "",
    partySize: r[5] || "",
    allergies: r[6] || "",
  }));
}
