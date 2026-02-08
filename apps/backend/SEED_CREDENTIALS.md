# Seed credentials (after `npm run seed`)

Use these to log into the **Admin Web** at `http://localhost:5173`.

---

## Super Admin (full access)

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@washhub.com` |
| Password | `admin123`         |

**Login:** Super Admin → redirects to `/super` (dashboard, providers list).

---

## Provider Admin – Demo Provider

| Field       | Value           |
|-------------|-----------------|
| Phone       | `+201111111111` |
| Password    | `provider123`   |
| Provider ID | *(copy from seed output or from Super Admin → Providers list)* |

**Login:** Provider → redirects to `/provider` (dashboard, clients, cars, wash jobs, plans, enrollment, payments, comments, QR).

---

## Provider Worker – Demo Provider

| Field       | Value           |
|-------------|-----------------|
| Phone       | `+201000000000` |
| Password    | `worker123`     |
| Provider ID | *(same as Demo Provider – copy from seed output or Providers list)* |

**Login:** Provider → redirects to `/worker` (today’s tasks only).

---

## Second provider – Cairo Wash Co

| Field       | Value           |
|-------------|-----------------|
| Phone       | `+202111111111` |
| Password    | `cairo123`      |
| Provider ID | *(copy from seed output or Super Admin → Providers list)* |

**Login:** Provider → redirects to `/provider` for Cairo Wash Co (1 client, 1 car).

---

## Client OTP (for Client App / API)

- Set `DEV_MODE=true` in `apps/backend/.env`.
- Request OTP for any client phone (e.g. `+201222222222`).
- Verify with code: **`0000`** (dev only).

---

## Seeded data summary

- **1** Super Admin  
- **2** Providers (Demo Provider, Cairo Wash Co)  
- **2** Provider users for Demo (Admin + Worker), **1** for Cairo  
- **5** Clients for Demo Provider (with cars), **1** client for Cairo  
- **2** Wash plans (Basic Weekly, Premium Inside) + enrollments  
- **Wash jobs** (today: NOT_STARTED, IN_PROGRESS, COMPLETED; 1 past COMPLETED)  
- **Payments** (several PAID monthly renewal, 1 PENDING)  
- **Client comments** (on first 2 clients)  
- **Notifications** (renewal reminders for 2 clients)

Run `npm run seed` from `apps/backend` to (re)create this data. Existing users/providers are not duplicated; new clients, plans, jobs, payments, and comments are added.
