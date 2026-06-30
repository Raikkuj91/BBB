import { appendRegistration } from "../lib/sheets.js";
import { sendConfirmationEmail } from "../lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_GROUPS = ["MTB", "Landsväg"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { name, email, phone, group, partySize, allergies } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "invalid_name" });
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (!VALID_GROUPS.includes(group)) {
    return res.status(400).json({ error: "invalid_group" });
  }
  const size = Number(partySize);
  if (!Number.isInteger(size) || size < 1 || size > 4) {
    return res.status(400).json({ error: "invalid_party_size" });
  }

  const entry = {
    name: name.trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : "",
    group,
    partySize: size,
    allergies: allergies ? String(allergies).trim() : "",
  };

  try {
    await appendRegistration(entry);
  } catch (err) {
    console.error("Kunde inte skriva till Google Sheets:", err);
    return res.status(500).json({ error: "sheets_failed" });
  }

  try {
    await sendConfirmationEmail(entry);
  } catch (err) {
    // Anmälan är redan sparad i Sheets, så vi misslyckas inte hela
    // requesten bara för att mailet inte gick iväg.
    console.error("Kunde inte skicka bekräftelsemail:", err);
  }

  return res.status(200).json({ ok: true });
}
