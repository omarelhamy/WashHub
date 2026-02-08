# Build state

- **Part 1 – Backend:** complete (todos 1.1–1.26).
- **Part 2 – Admin Web:** complete (todos 2.1–2.8).
- **Part 3 – Client App:** not started.

## How to run backend

1. Start PostgreSQL: `docker-compose up -d` (from repo root).
2. Copy env: `cp apps/backend/.env.example apps/backend/.env` (or create `.env` with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lamma3`).
3. Run: `cd apps/backend && npm run start:dev`.
4. Seed (optional): `cd apps/backend && npm run seed`.
5. Check: `GET http://localhost:3000/health` → `{ "status": "ok", "db": "connected" }`.

## Run Admin Web

1. `cd apps/admin-web`
2. Copy `.env.example` to `.env`, set `VITE_API_URL=http://localhost:3000`
3. `npm run dev` → `http://localhost:5173`
4. Login as Super Admin or Provider (see seed credentials).

## Seed credentials

See **apps/backend/SEED_CREDENTIALS.md** for full list. Quick reference:

- **Super Admin:** `admin@lamma3.com` / `admin123`
- **Provider Admin (Demo):** Phone `+201111111111` / `provider123` — Provider ID from seed output or Super Admin → Providers
- **Provider Worker (Demo):** Phone `+201000000000` / `worker123` — same Provider ID as Demo
- **Second Provider (Cairo):** Phone `+202111111111` / `cairo123` — Provider ID from seed output
- **Client OTP (dev):** `DEV_MODE=true`, request OTP for e.g. `+201222222222`, verify with code `0000`

Seed creates: 1 Super Admin, 2 providers (Demo + Cairo), 5 clients + cars for Demo, 2 wash plans + enrollments, wash jobs (today + past), payments (PAID + PENDING), client comments, notifications.

## Platform billing (per car)

- **Provider pays the platform per car.** Invoice = number of cars (under that provider) × fixed price per car.
- The **price per car** is set per provider by Super Admin in **Provider settings** (edit provider): `settings.pricePerCar` and optional `settings.billingCurrency` (default **EGP**).
- Super Admin sees the **platform invoice** (billing summary) on each provider’s detail page: car count, price per car, and total amount.
- Backend: `GET /providers/:id/billing` returns `{ carCount, pricePerCar, currency, totalAmount }`; same data is included in `GET /providers/:id/detail`.
