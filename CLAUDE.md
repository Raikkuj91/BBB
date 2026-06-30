# VM Sport – Anmälningssida för sommarfest

Projektkontext för Claude (och andra utvecklare) som jobbar i detta repo.

## Vad det här är

En registreringssida för VM Sports sommarfest, byggd som en enkel
React-app med ett par serverless API-endpoints. Deltagare fyller i ett
formulär, datan sparas i ett Google Sheet, och deltagaren får en
bekräftelse via e-post. Sami (admin) kan se deltagarlistan på en
lösenordsskyddad admin-sida.

## Event-detaljer (hårdkodade i UI-text och bekräftelsemail)

- Datum: söndag 20.7.2026
- Tid: kl 19:30
- Plats: Pavis terrass (bokad del av terrassen)
- Pris: Burgare + öl/läsk, 22 €
- Två grupper att välja mellan: **MTB** och **Landsväg**

Om datum/pris/plats ändras: uppdatera `src/i18n/translations.js`
(båda språken) och `lib/email.js`.

## Formulärfält

| Fält | Obligatoriskt | Typ |
|---|---|---|
| Namn | Ja | text |
| E-post | Ja | text, valideras med regex |
| Telefon | Nej | text |
| Grupp | Ja (default MTB) | "MTB" \| "Landsväg" |
| Antal personer | Ja | heltal 1–4 |
| Allergier/kost | Nej | fritext |

## Tech stack

- **React 19 + Vite** (rolldown-vite, `npm create vite@latest -- --template react`)
- **Tailwind CSS v4** via `@tailwindcss/vite`-pluginet (CSS-baserad config
  med `@theme` i `src/index.css`, inte en `tailwind.config.js`)
- **react-router-dom** för klientrouting (`/` = anmälan, `/admin` = adminvy)
- **Vercel serverless functions** i `/api` (vanliga Node-funktioner,
  `export default function handler(req, res)` – inget Next.js)
- **googleapis** för Google Sheets-skrivning/läsning via service account
- **resend** för bekräftelsemail

## Projektstruktur

```
api/
  register.js              POST – validerar, sparar i Sheet, skickar mail
  admin-participants.js    GET  – skyddad av ADMIN_PASSWORD, läser Sheet
lib/
  sheets.js                Google Sheets-klient (JWT service account)
  email.js                 Resend-klient + HTML-mall för bekräftelsemail
src/
  i18n/
    translations.js        Alla UI-strängar, sv + fi
    LanguageContext.jsx     React context för språkval (sparas i localStorage)
  components/
    LanguageToggle.jsx
    RegistrationForm.jsx
  pages/
    RegistrationPage.jsx    Startsida med event-info + formulär
    AdminPage.jsx            Lösenordsskydd + deltagartabell
  App.jsx                   Routes
  main.jsx                  Entry point, BrowserRouter
  index.css                 Tailwind import, @theme-tokens, @font-face
vercel.json                 SPA-rewrite så /admin funkar vid refresh
.env.example                Alla miljövariabler som behövs
```

## Design

- Primärfärg: `#366182`
- Mörk bakgrund: `#0d2b3c`
- Neutral text: `#d2d2d2`
- Font kropp: **Supreme**, rubriker: **Parabolica** (båda från Pangram
  Pangram Foundry, betalfonter)
- Mörkt tema, sportig känsla, mobilanpassad (testad ner till ~360px bredd)
- Designfiler kommer separat från Claude.ai Design – om de innehåller
  avvikande mått/komponenter, uppdatera `src/index.css` och komponenterna
  i `src/components/` och `src/pages/` i enlighet med dem.

**OBS – fonter saknas än:** Supreme och Parabolica är betalfonter och
filerna finns inte i repot. `src/index.css` har `@font-face`-deklarationer
som pekar på `public/fonts/Supreme-Variable.woff2` och
`public/fonts/Parabolica-Variable.woff2`. Lägg dit de licensierade
fontfilerna (eller ändra filnamnen/formaten i `@font-face` om de skiljer
sig) – tills då faller appen tillbaka på systemfonter och fungerar fint.

## Språk

Svenska (`sv`) är default och primärt språk. Finska (`fi`) är sekundärt.
Växling sker med en SV/FI-knapp längst upp, valet sparas i
`localStorage` (`vmsport_lang`). Alla strängar ligger i
`src/i18n/translations.js` – lägg till nya nycklar i båda språk-objekten
samtidigt.

## Admin-sida

Skyddad med ett delat lösenord (inte per-användarkonton – bedömt som
tillräckligt för ett litet event). Flöde:

1. Admin anger lösenord på `/admin`.
2. Klienten skickar lösenordet som header `x-admin-password` till
   `GET /api/admin-participants`.
3. Endpointen jämför mot `process.env.ADMIN_PASSWORD` och returnerar
   401 vid fel lösenord, annars deltagarlistan från Sheet.
4. Lösenordet sparas i `sessionStorage` på klienten så admin inte
   behöver skriva in det igen vid varje sidladdning (rensas när tabben
   stängs).

Det finns ingen "riktig" session/cookie – det är ett medvetet enkelt
upplägg för ett internt admin-verktyg med låg risk.

## Miljövariabler (se `.env.example`)

| Variabel | Beskrivning |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account-mailadress |
| `GOOGLE_PRIVATE_KEY` | Privat nyckel, med literal `\n` (omvandlas till radbrytningar i `lib/sheets.js`) |
| `GOOGLE_SHEET_ID` | ID på Google Sheet (ur URL:en) |
| `RESEND_API_KEY` | API-nyckel från Resend |
| `RESEND_FROM_EMAIL` | Avsändaradress, t.ex. `VM Sport <event@vmsport.fi>` |
| `ADMIN_PASSWORD` | Lösenord för adminvyn |

Google Sheet-flikens namn måste vara **`Anmälningar`** med kolumnerna
A–G: Tidsstämpel, Namn, E-post, Telefon, Grupp, Antal, Allergier
(se `SHEET_RANGE` i `lib/sheets.js` om det behöver ändras).

## Status / vad som är gjort

- [x] Projekt scaffoldat (Vite + React + Tailwind v4)
- [x] Registreringsformulär, sv/fi, validering
- [x] API: spara registrering till Google Sheets
- [x] API: bekräftelsemail via Resend
- [x] Admin-sida med lösenordsskydd
- [x] Lokal build/lint verifierad
- [ ] Fontfiler (Supreme, Parabolica) – väntar på licensfiler
- [ ] Google Sheets API-uppsättning (service account, delning av Sheet)
- [ ] Resend-konto + verifierad domän
- [ ] GitHub-repo
- [ ] Deploy till Vercel + miljövariabler

## Kommandon

```
npm install        # installera beroenden
npm run dev         # lokal dev-server
npm run build       # produktionsbygge
npm run lint         # oxlint
```
