# Meeting Call Reminder

A production-ready SaaS application that connects to your Google Calendar and automatically places a phone call 10 minutes before every scheduled meeting.

> **"Hello. You have a meeting in 10 minutes. Meeting title: [Event Title]."**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Google OAuth 2.0) |
| Voice calls | Twilio Programmable Voice |
| Calendar | Google Calendar API |
| Background jobs | Trigger.dev v3 |
| Deployment | Vercel |

---

## Features

- **Google Login** — OAuth 2.0, stores encrypted refresh tokens
- **Calendar Sync** — Syncs every 15 minutes via Trigger.dev, handles recurring events
- **Smart Scheduler** — Checks every minute, deduplicates reminders, handles timezones
- **Voice Calls** — Twilio outbound call with Amazon Polly TTS
- **Dashboard** — Upcoming meetings, connection status, call logs
- **Settings** — Reminder timing, SMS backup, WhatsApp backup, voice language, test calls
- **Security** — AES-256-GCM token encryption, Twilio webhook signature validation, Zod validation

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Google Cloud project with Calendar API + OAuth credentials
- Twilio account
- Trigger.dev account

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd meeting-call-reminder
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_reminder
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_WEBHOOK_URL=https://<ngrok-url>/api/webhooks/twilio
TRIGGER_SECRET_KEY=...
ENCRYPTION_KEY=$(openssl rand -hex 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

### 6. Start Trigger.dev (in a separate terminal)

```bash
npm run trigger:dev
```

### 7. Expose webhook for Twilio (optional, for local call testing)

```bash
npx ngrok http 3000
```

Update `TWILIO_WEBHOOK_URL` in `.env` with the ngrok HTTPS URL.

---

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Calendar API** and **Google People API**
4. Create **OAuth 2.0 credentials** (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

---

## Twilio Setup

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a phone number with Voice capability
3. Copy Account SID, Auth Token, and phone number to `.env`
4. For local dev: set Status Callback URL to your ngrok URL

---

## Trigger.dev Setup

1. Sign up at [trigger.dev](https://trigger.dev)
2. Create a new project
3. Copy the Secret Key and Project ID to `.env`
4. Run `npm run trigger:dev` — this connects your local jobs to Trigger.dev cloud

The two scheduled jobs are:
- **calendar-sync** — runs every 15 minutes, syncs all users' calendars
- **reminder-scheduler** — runs every minute, detects and fires reminders

---

## Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial commit"
git remote add origin <github-url>
git push
```

### 2. Import project in Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Add all environment variables from `.env`
- Set `DATABASE_URL` to your production PostgreSQL URL (e.g., Neon, Supabase, Railway)

### 3. Run migrations on production DB

```bash
DATABASE_URL=<prod-url> npx prisma migrate deploy
```

### 4. Deploy Trigger.dev jobs to cloud

```bash
npx trigger.dev@latest deploy
```

### 5. Update redirect URIs

In Google Cloud Console, add:
`https://your-domain.vercel.app/api/auth/callback/google`

Update `TWILIO_WEBHOOK_URL` to `https://your-domain.vercel.app/api/webhooks/twilio`.

---

## Database Schema

```
User ──< Account (NextAuth)
User ──< Session (NextAuth)
User ──1 CalendarConnection (encrypted tokens)
User ──< CalendarEvent
User ──< Reminder ──── CalendarEvent
User ──< CallLog
User ──1 Settings
```

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (32 bytes base64) |
| `NEXTAUTH_URL` | App base URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164) |
| `TWILIO_WEBHOOK_URL` | URL for Twilio status callbacks |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM token encryption |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

---

## Production Scaling Recommendations

1. **Database connection pooling** — Use [PgBouncer](https://www.pgbouncer.org/) or [Prisma Accelerate](https://www.prisma.io/accelerate) to handle Vercel's serverless connection spikes
2. **Trigger.dev concurrency** — Set `concurrencyLimit` on jobs for large user bases
3. **Twilio rate limits** — Add a queue for bulk calls to stay within Twilio's 1 call/sec default
4. **Token refresh failures** — Add a monitoring alert if >N% of calendar syncs fail
5. **Vercel Function timeout** — Reminder scheduler runs within 55s budget; increase if user count grows
6. **Caching** — Use Next.js `unstable_cache` on the dashboard server components to reduce DB queries
