# WashHub Backend

NestJS API for the Car Wash SaaS platform (Egypt).

## Prerequisites

- Node 18+
- PostgreSQL 15+ (or use Docker)
- npm or pnpm

## Setup

1. **Start PostgreSQL** (from repo root):
   ```bash
   docker-compose up -d
   ```

2. **Copy env**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/washhub`.

3. **Install and run**:
   ```bash
   npm install
   npm run start:dev
   ```
   The API runs at `http://localhost:3000`. Schema is synced automatically in development (`synchronize: true`).

4. **Seed data** (optional):
   ```bash
   npm run seed
   ```
   Creates: Super Admin `admin@washhub.com` / `admin123`, Demo Provider, Provider Admin `+201111111111` / `provider123`, Worker `+201000000000` / `worker123`, Client `+201222222222` with car.

## Env vars

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – JWT signing secret
- `JWT_EXPIRY` – e.g. `7d`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` – for client OTP (optional in dev)
- `DEV_MODE=true` – accept OTP `0000` without Twilio

## Endpoints

- `GET /health` – DB health check
- `POST /auth/super-admin/login` – Super Admin login (email + password)
- `POST /auth/provider/login` – Provider User login (phone + password + providerId)
- `POST /auth/client/request-otp` – Request OTP (phone + providerId)
- `POST /auth/client/verify-otp` – Verify OTP and get JWT (phone + code + providerId)
- `POST /public/enroll` – Public client enrollment (code, name, phone, optional car)
- CRUD: `/providers`, `/provider-users`, `/clients`, `/cars`, `/wash-jobs`, `/wash-stages`, `/payments`, `/wash-plans`, `/client-comments`, `/notifications`
- **Billing (per car):** `GET /providers/:id/billing` (Super Admin) – returns `{ carCount, pricePerCar, currency, totalAmount }`. Providers pay the platform per car; invoice = car count × price per car. The price per car is stored in `provider.settings.pricePerCar` (and optional `settings.billingCurrency`; default **EGP**), set by Super Admin when editing a provider.

Protected routes require `Authorization: Bearer <token>`.

## DB sync vs migrations

- **Development:** `synchronize: true` – schema is created/updated from entities on startup.
- **Production:** set `NODE_ENV=production` and use TypeORM migrations (disable synchronize) to avoid data loss.
