# Store security (owner protection)

## Checkout protections

| Protection | What it does |
|------------|----------------|
| **Server-side pricing** | `place_secure_order` RPC (Supabase) or `resolveCartFromCatalog` rebuilds cart from live product prices — customers cannot lower prices via browser/localStorage. |
| **Stock enforcement** | Quantities capped in cart UI; checkout verifies stock from catalog; RPC decrements only when `stock >= qty`. |
| **Minimum order** | ₱10,000 subtotal before tax. |
| **Maximum order** | ₱100,000 total. |
| **Tax** | 10% applied consistently in cart UI and server total. |
| **Disposable emails** | Blocked at validation (temp-mail domains). |
| **Honeypot** | Hidden `website` field — bots that fill it are rejected. |
| **Rate limits** | Checkout: 3 attempts / 2 min per browser; order tracking limited. |
| **RLS** | After running `supabase/secure_checkout.sql`, direct public `INSERT` on `orders` is removed. |

## Required Supabase step

Run in SQL Editor (after `schema.sql`):

```
supabase/secure_checkout.sql
```

This installs `place_secure_order` and removes the unsafe open order-insert policy.

## Still recommended for production

- Payment gateway (Stripe, PayMongo, etc.) — confirm payment before marking orders shipped.
- Email order confirmations.
- CAPTCHA on checkout if you see spam orders.
- Never expose `service_role` key in the frontend.
