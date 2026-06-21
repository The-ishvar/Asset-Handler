---
name: Bhaleri shop routes
description: Two shop systems exist; which route goes where; auto-booking path
---

## Shop Systems

Two separate shop systems exist in the app:

1. **User-created shops** (primary system, shown in nav as "Shops"):
   - List: `/user-shops` → `UserShopsPage`
   - Detail: `/shop/:id` → `ShopView` (at `src/pages/my-shop/shop.jsx`)
   - Uses `useListUserShops` / `useGetUserShop` hooks → `/user-shops` API endpoint
   - Already has "Chat with Shop Owner" button (renders when `user && shop.userId !== user.id`)

2. **Legacy shop system** (NOT shown in nav):
   - List: `/shops` → `ShopsList`
   - Detail: `/shops/:id` → `ShopDetail` (at `src/pages/shops/detail.jsx`)
   - Uses `useGetShop` hook → `/shops/:id` API endpoint

## Booking Routes
- Auto booking: `/book/auto` (requires auth — redirects to login when logged out)
- Bus booking: `/book/bus`

## Feature Flag Keys
Enabled: posts, shops, autoBooking, busBooking, reels, marketplace, messages
Disabled: medical, schools, map, emergency, jobs, events, notices, snaps, stories, bookEvent, about, provider, notifications

**Why:** Knowing these distinctions avoids confusion when adding "Chat with Shop Owner" features or debugging 404s on shop pages.
