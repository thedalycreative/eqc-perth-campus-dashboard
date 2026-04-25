# EQC Perth Campus Dashboard

> A live lobby dashboard for the **Equinim College — Perth Campus**. Shows current room allocations, weather, announcements, the campus floorplan, and trainer sign-on — all updating in real time across every screen on campus.

[![Live Site](https://img.shields.io/badge/Live_Site-Visit-1a7a54?style=for-the-badge)](#)
[![Hosted on Cloud Run](https://img.shields.io/badge/Hosted_on-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Stack](https://img.shields.io/badge/Stack-React_19_·_Vite_·_Express_·_Socket.io-1A1A1A?style=for-the-badge)](#)

> [!NOTE]
> Replace the **Live Site** badge link above with the Cloud Run URL after the first deploy.

---

## Architecture & Naming

| Layer | Name / Reference |
|---|---|
| Local folder | `eqc-perth-campus-dashboard` |
| GitHub repo | `thetimdaly/eqc-perth-campus-dashboard` |
| Cloud Run service | `eqc-perth-campus-dashboard` |
| Region | `australia-southeast1` (Sydney) |
| Frontend framework | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 |
| Backend | Express 4 + Socket.io 4 (single Node process) |
| Real-time channel | WebSockets via Socket.io |
| Trainer sign-on | Static HTML at `/trainer-sign-on.html` (Google Form embed) |

---

## How it Works

The dashboard runs as a single Node process. Express serves the built React SPA from `dist/`, and Socket.io shares a live state map (rooms, events, staff sign-ons, announcements) with every connected client. When a trainer signs on, an admin posts an announcement, or midnight rolls around (which auto-resets the room board), the server broadcasts the change and every screen on campus updates instantly without a refresh.

There are three surfaces:

- **The lobby screen** (`/`) — the main dashboard, designed to live on a Samsung Frame TV in reception.
- **The trainer sign-on portal** (`/trainer-sign-on.html`) — a QR-code-friendly page that embeds a Google Form. Trainers fill in their name, room, course, and topics for the day; the admin dashboard reads from the same backend.
- **The admin panel** — hidden behind a small cog icon in the footer, password-protected against `ADMIN_PASSWORD`. Lets staff override room status, post events, and create announcements with auto-expiry.

State is kept in memory on the server, which is fine for a lobby kiosk that resets at midnight anyway. There's no database to manage.

---

## Operating Guide

> [!NOTE]
> This guide is for **staff and trainers at EQC Perth**. No technical background needed.

### As a trainer signing on for class

1. Walk past the lobby screen on the way in
2. Scan the **Trainer Sign-On QR** (or open the cog icon in the footer and tap "Trainer Sign-On Portal")
3. Fill in your name, intake, room, course, and what you're teaching today
4. Hit **Sign On** — your room flips to "Live" on every screen on campus

### As an admin

1. Tap the small cog icon in the footer (bottom-right)
2. Enter the admin password
3. Use the three tabs: **Rooms** (override status, edit details), **Events** (add/remove upcoming events), **Alerts** (post a scrolling announcement with an expiry)

### Verify everything is working

- [ ] Lobby screen loads and the clock is ticking
- [ ] All six rooms display as **Available** at the start of the day
- [ ] WiFi QR (`EQC-network`) scans and connects
- [ ] Floorplan image renders cleanly
- [ ] Google Map of West Perth loads in the bottom-right tile
- [ ] Trainer Sign-On portal opens via the QR
- [ ] An announcement posted by an admin appears on the marquee within ~1 second

---

## Local Development

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env       # then edit ADMIN_PASSWORD
npm run dev                # http://localhost:3000
```

The `npm run dev` script starts Express + Socket.io with Vite middleware mode, so the React app hot-reloads while the backend stays alive.

### Other scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run the dev server with hot reload |
| `npm run build` | Build the frontend into `dist/` |
| `npm run start` | Run the production server (serves from `dist/`) |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Delete `dist/` |

---

## Deploying to Google Cloud Run

The dashboard needs a long-running Node process (because of WebSockets), so it runs as a Cloud Run container. A `Dockerfile` is included.

> [!TIP]
> `--min-instances 1` keeps a warm container for the lobby screen so it never cold-starts. If you're trying to stay free-tier, set this to `0` and accept a ~2s cold start.

### Updating the password later

```bash
gcloud run services update eqc-perth-campus-dashboard \
  --region australia-southeast1 \
  --update-env-vars ADMIN_PASSWORD=NEW-STRONG-PASSWORD
```

---

## Environment Variables

| Variable | Where | Required | Notes |
|---|---|---|---|
| `ADMIN_PASSWORD` | server (Cloud Run secret) | **yes in production** | Falls back to `"asdf"` in local dev with a warning |
| `PORT` | server | no | Cloud Run injects this; defaults to `3000` locally |
| `NODE_ENV` | server | yes in prod | Set to `production` to serve `dist/` instead of running Vite |

> [!IMPORTANT]
> Never commit a real `.env` file. The repo ships `.env.example` only — `.env*` is in `.gitignore`. Set production secrets via Cloud Run's environment-variables panel or Secret Manager.

---

## Project Reference Files

- [`PROJECT.md`](./PROJECT.md) — what this project is, who it's for, and the user journey
- [`BRAND.md`](./BRAND.md) — the EQC visual and tonal reference (colours, type, voice)

These live at the project root and are the source of truth for design and copy decisions. Update them as the project evolves.

---

## Compliance

This is the public-facing screen of a **Registered Training Organisation (RTO 45758, CRICOS 03952E)**. The footer lists the campus address, phone, email, fire-assembly point, and first-aid location. **Do not remove these** — they're a regulatory requirement.

---

## License

Internal project for EQC Institute / Equinim College. All trademarks and brand assets belong to their respective owners.
