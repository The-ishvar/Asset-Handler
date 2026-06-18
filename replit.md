# Bhaleri Online

A full-stack village community portal for Bhaleri village (India) — connecting residents with local services, marketplace, social features, and community information.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000/8080)
- `pnpm --filter @workspace/bhaleri-online run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (Tailwind CSS, shadcn/ui components)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (16 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: JWT (Bearer token, `requireAuth` / `optionalAuth` middleware)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/index.ts` — All 16 DB table definitions
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — `requireAuth`, `optionalAuth` JWT middleware
- `artifacts/bhaleri-online/src/pages/` — All React page components
- `artifacts/bhaleri-online/src/lib/theme.tsx` — Dark mode provider (toggles `.dark` on `<html>`)
- `artifacts/bhaleri-online/src/components/layout.tsx` — Main layout with navbar + mobile bottom nav

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → typed hooks. Never add API endpoints without updating the spec first.
- `optionalAuth` middleware: routes that behave differently for logged-in vs guest users use this instead of `requireAuth`.
- Social routes (follow, profile, update-profile) are in a separate `social.ts` router mounted at root (`/`) with full paths like `/users/:id/profile` to avoid conflicts with existing `/users` router.
- Video storage: no external service — users paste YouTube or direct MP4 URLs. YouTube links are auto-converted to embed URLs.
- Notifications & chat: polling-based (no WebSocket/Socket.io). Notifications poll every 30s, chat polls every 5s.
- CSS dark mode: `@custom-variant dark (&:is(.dark *))` — class-based toggling on `<html>` element.

## Product

- **Home**: Hero banner, village services grid, recent events/notices
- **Directory**: Schools, Medical, Shops, Bus schedules, Emergency contacts
- **Buy & Sell**: Marketplace with filters, photo support, seller contact + message
- **Jobs**: Local job listings
- **Events & Notices**: Community announcements
- **Reels**: Instagram-style vertical-scroll video feed (YouTube + direct MP4)
- **Social Profiles**: Follow/unfollow, bio, cover photo, listing & reel grids
- **Notifications**: Real-time-ish unread badge, mark all read
- **Chat**: Direct messaging between users
- **Village Map**: Embedded map with landmarks
- **Admin Panel**: Full CRUD for all directory entries + listing moderation
- **Dark Mode**: System-wide toggle

## DB Tables (16 total)

Users, schools, medical_stores, shops, listings, buses, jobs, events, notices, emergency_contacts, reels, reel_likes, reel_comments, follows, notifications, messages

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **OpenAPI spec change → must run codegen**: `pnpm --filter @workspace/api-spec run codegen`. The `queryKey` TS error in existing hook usages is a pre-existing project pattern — does not block dev/build.
- **Event date field**: The Event schema uses `date` (not `eventDate`).
- **Social router**: Mount at `/` root in routes/index.ts — it defines full paths internally (`/users/:id/profile`, etc.).
- **Admin seeding**: Admin user password hash in seed may be fake. Register a new user and set role via DB if needed.
- Always run `typecheck:libs` after changing any `lib/*` package.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
