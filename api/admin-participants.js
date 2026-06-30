import { getParticipants } from "../lib/sheets.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const password = req.headers["x-admin-password"];
  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD är inte satt i miljövariablerna.");
    return res.status(500).json({ error: "admin_password_not_configured" });
  }
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const participants = await getParticipants();
    return res.status(200).json({ participants });
  } catch (err) {
    console.error("Kunde inte hämta deltagare:", err);
    return res.status(500).json({ error: "sheets_failed" });
  }
}
