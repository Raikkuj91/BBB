import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "VM Sport <event@vmsport.fi>";

const GROUP_LABEL = {
  MTB: "MTB",
  "Landsväg": "Landsväg",
};

function buildHtml(entry) {
  return `
  <div style="font-family:sans-serif;background:#0d2b3c;color:#d2d2d2;padding:32px;border-radius:12px;">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">Tack för din anmälan, ${escapeHtml(entry.name)}!</h1>
    <p style="margin:0 0 16px;">Du är anmäld till VM Sports sommarfest:</p>
    <ul style="line-height:1.6;padding-left:18px;">
      <li><strong>Datum:</strong> Söndag 20.7.2026</li>
      <li><strong>Tid:</strong> Kl 19:30</li>
      <li><strong>Plats:</strong> Pavis terrass (bokad del av terrassen)</li>
      <li><strong>Pris:</strong> Burgare + öl/läsk: 22 €</li>
      <li><strong>Grupp:</strong> ${escapeHtml(GROUP_LABEL[entry.group] || entry.group)}</li>
      <li><strong>Antal personer:</strong> ${escapeHtml(String(entry.partySize))}</li>
      ${entry.allergies ? `<li><strong>Allergier/kost:</strong> ${escapeHtml(entry.allergies)}</li>` : ""}
    </ul>
    <p style="margin:24px 0 0;color:#9fb4c4;">Välkommen! / VM Sport</p>
  </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendConfirmationEmail(entry) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Saknar RESEND_API_KEY i miljövariablerna.");
  }
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: FROM,
    to: entry.email,
    subject: "Bekräftelse – VM Sport Sommarfest 20.7.2026",
    html: buildHtml(entry),
  });
}
