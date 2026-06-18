---
name: Bhaleri social routes
description: How optionalAuth middleware and the social router are wired in this project
---

# Social Route Wiring

## optionalAuth
Added to `artifacts/api-server/src/middlewares/auth.ts` — silently parses JWT if present, sets `req.user`, never rejects. Used by reels (public feed but isLiked depends on user) and social profile (isFollowing depends on user).

## Social router mounting
`artifacts/api-server/src/routes/social.ts` defines full paths (`/users/:id/profile`, `/users/:id/follow`, `/users/me/update-profile`). It is mounted at `"/"` root in `routes/index.ts` via `router.use(socialRouter)` — NOT at `/users`. This avoids conflicts with the existing users router which handles `/users/:id` (GET/PATCH/DELETE).

**Why:** Mounting at `/users` would require sub-paths like `/:id/profile` which could conflict with the existing `/:id` catch-all in users.ts.

## Video storage
No Cloudinary/S3 on free tier. Users paste YouTube or direct MP4 URLs. YouTube URLs are auto-converted to embed format in the Reels component. Thumbnails are optional.

## Polling strategy
- Notifications: poll every 30s (layout.tsx, notifications page)
- Chat messages: poll every 5s (conversation page)
- No WebSocket/Socket.io
