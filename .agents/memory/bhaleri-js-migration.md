---
name: Bhaleri JS migration
description: Key decisions from .tsx→.jsx migration, phone auth, super_admin role, Socket.IO, and backend field alias patterns
---

# Bhaleri Online — JS Migration & Feature Decisions

## Phone-based auth (replaces email)
- Frontend sends `{ phone, password }` to `/api/auth/login` and `/api/auth/register`
- DB `usersTable`: `email` made nullable (no `notNull()`), `phone` has `unique()` constraint
- Super Admin: env vars `SUPER_ADMIN_PHONE` and `SUPER_ADMIN_PASSWORD` (set as shared env vars)
- Super Admin login bypasses bcrypt lookup — creates/upgrades user to `super_admin` role on first login
- `roleEnum` updated to include `["user", "admin", "super_admin"]` — needed `push-force` after adding new enum value

## requireAdmin middleware
- Updated to allow both `admin` AND `super_admin` roles (was only `admin`)
- File: `artifacts/api-server/src/middlewares/auth.ts`

## DB field name aliases in backend routes
Backend DB schemas use different field names than what the frontend expects. Routes now map both ways:
- `medicalStoresTable`: DB has `contactNumber`/`location` → frontend expects `phone`/`address`
- `shopsTable`: DB has `contactNumber`/`location` → frontend expects `phone`/`address`
- `schoolsTable`: DB has `contactNumber`/`classInfo`/`feeInfo` → frontend expects `phone`/`type`/`description`
- `busesTable`: DB has `departureTime` → frontend expects `timing`; no `from`/`to` columns (nulled)
- `jobsTable`: DB has `contactNumber` → frontend expects `contactPhone`
- `emergencyContactsTable`: DB has `contactNumber` → frontend expects `phone`; `category` defaults to "other"
**Why:** Never changed DB schema; added aliases in `fmt()` functions and flexible POST handlers accepting both field names.

## Socket.IO setup
- Installed `socket.io` in api-server, `socket.io-client` in bhaleri-online
- `artifacts/api-server/src/lib/socket.ts` — init function, user rooms (`user:{id}`), conversation rooms
- `artifacts/api-server/src/index.ts` uses `http.createServer(app)` then `initSocket(httpServer)`
- Socket path: `/api/socket.io`

## Stats route aliases
- Frontend calls `/api/stats` and `/api/stats/activity`
- Backend exposes both primary paths AND legacy `/dashboard`/`/recent-activity` aliases

## Vite entry point
- `index.html` updated: `main.tsx` → `main.jsx`
- Old `.tsx` files exist alongside `.jsx` — Vite resolves `.jsx` before `.tsx` by default extension order, so no conflict

## DB push commands
- Schema changes: `pnpm --filter @workspace/db run push`
- For enum additions (irreversible): `pnpm --filter @workspace/db run push-force`
