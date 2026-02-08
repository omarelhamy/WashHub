# WashHub Admin Web

React admin dashboard for Super Admin, Provider Admin, and Worker roles.

## Stack

- Vite + React + TypeScript
- React Router, TanStack Query, Axios
- Tailwind CSS v4
- react-i18next (EN/AR, RTL for Arabic)

## Setup

1. **Env:** Copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:3000` (or your backend URL).

2. **Run:**
   ```bash
   npm install
   npm run dev
   ```
   App runs at `http://localhost:5173`.

3. **Login:**
   - **Super Admin:** email + password (e.g. after seed: `admin@washhub.com` / `admin123`).
   - **Provider:** phone + password + providerId (e.g. after seed: `+201111111111` / `provider123` and provider ID from backend).
   - **Worker:** same as Provider with a worker account (e.g. `+201000000000` / `worker123`).

## Routes

- `/login` – Login (Super Admin or Provider).
- `/super` – Super Admin dashboard.
- `/super/providers` – Providers list.
- `/provider` – Provider Admin dashboard.
- `/provider/clients` – Clients list.
- `/provider/cars` – Cars (by client ID).
- `/provider/wash-jobs` – Wash jobs list.
- `/provider/wash-plans` – Wash plans list.
- `/provider/payments` – Payments list.
- `/provider/qr` – Enrollment link/QR info.
- `/worker` – Worker dashboard (today’s tasks).
- `/worker/tasks` – Same as worker dashboard.

## i18n

- Toggle EN/AR in the header (button next to Logout).
- Arabic uses RTL layout.
