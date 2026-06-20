---
name: Bhaleri Marketplace upgrade
description: Key decisions from the full marketplace (Buy & Sell) redesign — DB schema changes, new tables, API routes, hook signatures.
---

# Bhaleri Marketplace Upgrade

## DB: New columns on `listingsTable`
Added: `category` (text, default "Others"), `discountPrice` (numeric, optional MRP/original price),
`location` (text), `quantity` (integer, default 1), `deliveryAvailable` (boolean),
`isSoldOut` (boolean), `userAvatar` (text).

**Why:** Meesho-style product cards need these fields. `discountPrice` = MRP (higher), `price` = selling price (lower).
Discount% = (discountPrice - price) / discountPrice × 100.

## DB: New tables
- `wishlist` (userId, listingId)
- `orders` (userId, listingId, sellerId, quantity, totalAmount, deliveryAddress, paymentMethod, status, buyerName, buyerPhone, listingTitle)
- `listing_reviews` (userId, listingId, rating 1-5, comment, userName, userAvatar)
- `cart_items` got new `quantity` column (default 1)

## Auto-approve listings
POST /listings now sets `status: "approved"` (not "pending"). Admin can still reject from panel.
**Why:** Village marketplace with small community — pre-moderation adds too much friction, and it was the root cause of "products not showing" bug.

## userName saved on listing creation
The POST /listings route now queries `usersTable` to save `userName` and saves it on the listing row.

## useAddToCart hook signature changed
**Before:** `addToCart.mutate(listingId, { onSuccess, onError })`
**After:** `addToCart.mutate({ listingId, quantity }, { onSuccess, onError })`
**Why:** Cart now supports quantity. Any code calling `useAddToCart` must pass an object `{ listingId }`.

## New API routes
- `GET/POST/DELETE /wishlist` — toggle returns `{ wishlisted: boolean }`
- `POST /orders` — creates order for a single listing (one per cart item at checkout)
- `GET /orders` — buyer's orders
- `GET /orders/selling` — seller's orders
- `PATCH /orders/:id/status` — update order status
- `GET /listings/:id/reviews` — get reviews
- `POST /listings/:id/reviews` — submit review { rating, comment }
- `PATCH /cart/:listingId` — update quantity

## New frontend routes
- `/checkout` — checkout page (FeatureGate: marketplace)

## ImageUpload component
`artifacts/bhaleri-online/src/components/marketplace/ImageUpload.jsx`
Uses presigned URL pattern: POST /storage/uploads/request-url → PUT to uploadURL → store objectPath.
