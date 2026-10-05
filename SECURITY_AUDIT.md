# WarehouseHub — Security Audit Report
**Framework**: OWASP Top 10:2025  
**Date**: 2026-10-05  
**Auditor**: Application Security Engineer (Automated Review)  
**Scope**: Full repository — frontend, API routes, Supabase config, RLS policies, auth, OAuth, cart, checkout, orders, inventory, email, middleware, deployment  
**Mode**: READ-ONLY — no code was modified during this audit

---

## Executive Summary

WarehouseHub is a Next.js 15 / Supabase ecommerce application. The overall security posture is **moderate**. RLS is enabled on all tables and the server-side API route correctly verifies the authenticated user before creating orders. However, several significant vulnerabilities exist that must be remediated before production deployment. The most critical issues are:

1. **Price/total trust from client** — the checkout page sends `unitPrice` from the browser; the API route uses it verbatim without re-fetching the authoritative price from the database.
2. **Open redirect in OAuth callback** — the `next` query parameter is not validated, enabling phishing-quality redirects.
3. **`x-sb-token` header injection** — the middleware accepts an arbitrary token from any request header and injects it as a session cookie, bypassing normal session establishment.
4. **Edge Function CORS wildcard** — the `send-order-confirmation` function accepts requests from any origin with no authentication check on the caller.
5. **`generate_order_number` RPC is callable by authenticated users** — the function has no `SECURITY DEFINER` guard limiting who can call it.
6. **`clearCart` deletes by `user_id` from the client** — the Supabase client call uses the client-side `user.id` value, which RLS should protect, but the pattern is fragile.
7. **`email_error` field stored in DB and surfaced in confirmation page** — internal error strings (API keys, stack traces) can leak to the browser in development and potentially in production.

---

## OWASP Top 10:2025 Findings

---

### A01 — Broken Access Control

#### FINDING A01-1 — CRITICAL: Price Manipulation via Client-Supplied `unitPrice`

**File**: `src/app/checkout/page.tsx` (lines 155–165), `src/app/api/orders/route.ts` (lines 89–95)

**Description**:  
The checkout page constructs the order payload client-side and includes `unitPrice: li.product.basePrice` for each item. The API route (`/api/orders`) receives this value and uses it directly to compute `subtotal` and `total` without ever querying the database for the authoritative product price.

```typescript
// checkout/page.tsx — client sends price
items: items.map((li) => ({
  ...
  unitPrice: li.product.basePrice,   // ← attacker can set this to 0.01
  ...
}))

// api/orders/route.ts — server trusts it
const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
```

A malicious user can intercept the POST request, set `unitPrice` to `0.01` for any item, and place an order at an arbitrary price. The inventory check queries the database, but the price check does not.

**Remediation**:  
In `api/orders/route.ts`, after the inventory check loop, fetch `base_price` (and `price_delta` for variants) from the database for each `productId`/`variantId` pair. Compute `unitPrice`, `subtotal`, and `total` server-side. Reject the request if the client-supplied price deviates by more than a small tolerance (or simply ignore the client price entirely).

```typescript
// Fetch authoritative price server-side
const { data: product } = await supabase
  .from('products')
  .select('id, base_price')
  .eq('id', item.productId)
  .single();

const unitPrice = Number(product.base_price); // ignore item.unitPrice
```

---

#### FINDING A01-2 — HIGH: Open Redirect in OAuth Callback

**File**: `src/app/auth/callback/route.ts` (line 8)

**Description**:  
The `next` query parameter is read from the URL and used directly in a redirect without validation:

```typescript
const next = searchParams.get('next') ?? '/';
...
return NextResponse.redirect(`${origin}${next}`);
```

An attacker can craft a link such as:
```
https://warehouseh2608.builtwithrocket.new/auth/callback?code=...&next=//evil.com/phishing
```
After a successful OAuth exchange the user is redirected to `evil.com`. Because the redirect originates from the legitimate domain after a real Google login, it is highly convincing.

**Remediation**:  
Validate that `next` is a relative path starting with `/` and does not begin with `//` or contain a protocol:

```typescript
const rawNext = searchParams.get('next') ?? '/';
const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';
```

---

#### FINDING A01-3 — HIGH: `x-sb-token` Header Injection in Middleware

**File**: `src/middleware.ts` (lines 4–15)

**Description**:  
The middleware reads an arbitrary `x-sb-token` header from any incoming request and injects it as the Supabase auth cookie:

```typescript
function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}
```

Any request that does not already have an auth cookie can supply an arbitrary JWT via this header. If an attacker obtains a valid JWT for any user (e.g., from a leaked log, a compromised device, or a stolen token), they can replay it via this header even if the cookie has been cleared. This also means that server-side session validation can be bypassed by header injection from any network path that can reach the Next.js server.

**Note**: The client-side `fetch` patch in `src/lib/supabase/client.ts` (lines 72–84) is the intended sender of this header — it forwards the in-memory token to same-origin API routes. However, the middleware accepts this header from **any** caller, not just the browser's own fetch.

**Remediation**:  
- Remove the `injectTokenFromHeader` mechanism entirely and rely solely on the standard Supabase SSR cookie flow.
- If the header forwarding is required for the sandboxed iframe environment, restrict it to same-origin requests only (check `Origin` or `Referer` header) and add a HMAC signature to prevent forgery.

---

#### FINDING A01-4 — MEDIUM: `cart_items` DELETE Uses Client-Side `user_id`

**File**: `src/contexts/CartContext.tsx` (lines 330–333)

**Description**:  
The `clearCart` function issues a Supabase client-side delete filtered by `user_id`:

```typescript
await supabase.from('cart_items').delete().eq('user_id', user.id);
```

RLS policy `users_delete_own_cart_items` uses `USING (user_id = auth.uid())`, which correctly enforces ownership at the database level. However, the client is still supplying `user_id` as a filter — if RLS were ever misconfigured or disabled, this would allow deletion of another user's cart by supplying their ID. The safer pattern is to omit the filter and let RLS enforce it exclusively:

```typescript
await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
// RLS ensures only the authenticated user's rows are deleted
```

**Remediation**:  
Remove the `.eq('user_id', user.id)` filter from the client-side `clearCart` call. RLS is the authoritative enforcement layer; the client filter is redundant and potentially misleading.

---

#### FINDING A01-5 — MEDIUM: `order_items` INSERT Policy Allows Subquery Manipulation

**File**: `supabase/migrations/20260930230000_orders_and_email.sql` (lines 83–91)

**Description**:  
The `users_insert_own_order_items` RLS policy uses a subquery:

```sql
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);
```

This means an authenticated user can directly call `supabase.from('order_items').insert(...)` from the browser and insert items into any order they own — including orders already confirmed. There is no server-side guard preventing a user from adding items to a completed order after the fact.

**Remediation**:  
Add a `status = 'pending'` check to the subquery, or (preferred) remove the INSERT policy entirely and only allow `order_items` inserts via a `SECURITY DEFINER` server-side function or the service-role key used exclusively in the API route.

---

### A02 — Cryptographic Failures

#### FINDING A02-1 — LOW: Auth Token Stored in `localStorage` Fallback

**File**: `src/lib/supabase/client.ts` (lines 34–42, 100–110)

**Description**:  
When third-party cookies are blocked (common in Safari and Firefox), the client falls back to storing the Supabase auth token in `localStorage` under a `sb_` prefix. `localStorage` is accessible to any JavaScript running on the page, making the token vulnerable to XSS attacks. If any third-party script or a future XSS vulnerability is introduced, the token can be exfiltrated.

**Remediation**:  
- Prefer `HttpOnly` cookies for token storage (the default Supabase SSR flow).
- If `localStorage` fallback is required for the sandboxed environment, document this as an accepted risk and ensure a strict Content Security Policy is in place.
- Consider using `sessionStorage` instead of `localStorage` to limit token lifetime to the browser tab.

---

#### FINDING A02-2 — LOW: `SameSite=None; Secure; Partitioned` Cookie Attributes

**File**: `src/lib/supabase/client.ts` (line 44)

**Description**:  
Auth cookies are set with `SameSite=None; Secure; Partitioned`. `SameSite=None` disables CSRF protection for these cookies — they will be sent on cross-site requests. While Supabase JWTs are bearer tokens (not session cookies in the traditional sense), this configuration weakens the CSRF posture of any state-mutating endpoints that rely on cookie presence.

**Remediation**:  
Use `SameSite=Lax` where possible. Only use `SameSite=None` if cross-site embedding is a hard requirement (e.g., the iframe sandbox). Document the trade-off.

---

### A03 — Injection

#### FINDING A03-1 — LOW: HTML Injection in Order Confirmation Email

**File**: `supabase/functions/send-order-confirmation/index.ts` (lines 44–57)

**Description**:  
Customer-supplied values (`order.customer_name`, `item.product_name`, `item.variant_name`) are interpolated directly into the HTML email template without escaping:

```typescript
<h2>Thank you, ${order.customer_name}!</h2>
...
${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ""}
```

If a product name or customer name contains `<script>` tags or HTML entities, the email client may render them. While most modern email clients strip scripts, this can still cause visual corruption or phishing-quality content injection.

**Remediation**:  
HTML-escape all user-supplied strings before interpolation:

```typescript
function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

---

### A04 — Insecure Design

#### FINDING A04-1 — HIGH: No Payment Gateway — Orders Created as "Paid" Without Payment

**File**: `src/app/api/orders/route.ts` (lines 100–115)

**Description**:  
Orders are inserted with `payment_status: 'paid'` and `payment_method: 'direct'` without any actual payment being collected. The checkout page states "Payment collected on delivery or by invoice." This is a business-logic design issue: there is no mechanism to prevent a user from placing unlimited orders with no payment commitment, and the system records them as paid.

**Remediation**:  
- If cash-on-delivery / invoice is the intended model, set `payment_status: 'pending'` on creation and only mark `'paid'` after manual confirmation.
- Add rate limiting on the `/api/orders` endpoint to prevent order flooding.
- Consider requiring a deposit or card authorisation before order confirmation.

---

#### FINDING A04-2 — MEDIUM: No Rate Limiting on Order Creation or Auth Endpoints

**File**: `src/middleware.ts`, `src/app/api/orders/route.ts`

**Description**:  
There is no rate limiting on:
- `/api/orders` — an authenticated user can create thousands of orders per minute
- `/auth/callback` — no throttling on OAuth code exchange attempts

**Remediation**:  
Implement rate limiting using Vercel's built-in Edge middleware rate limiting, or an upstash/redis-based solution. At minimum, limit `/api/orders` to 10 requests per minute per authenticated user.

---

### A05 — Security Misconfiguration

#### FINDING A05-1 — HIGH: Edge Function CORS Wildcard with No Caller Authentication

**File**: `supabase/functions/send-order-confirmation/index.ts` (lines 12–18)

**Description**:  
The Edge Function accepts requests from any origin (`Access-Control-Allow-Origin: *`) and is called with the public anon key:

```typescript
// api/orders/route.ts
Authorization: `Bearer ${supabaseAnonKey}`,
```

The anon key is a public key (prefixed `NEXT_PUBLIC_`), meaning anyone who knows the Supabase project URL and anon key can call this Edge Function directly, triggering emails to arbitrary addresses. This enables:
- Email spam / abuse of the Resend quota
- Potential phishing emails appearing to come from the WarehouseHub domain

**Remediation**:  
- Call the Edge Function using the **service-role key** (server-side only, never exposed to the browser) instead of the anon key.
- Add a shared secret header check inside the Edge Function:
  ```typescript
  const secret = req.headers.get('x-internal-secret');
  if (secret !== Deno.env.get('INTERNAL_SECRET')) {
    return new Response('Forbidden', { status: 403 });
  }
  ```
- Restrict CORS to the application origin instead of `*`.

---

#### FINDING A05-2 — MEDIUM: `generate_order_number` RPC Has No Access Restriction

**File**: `supabase/migrations/20260930230000_orders_and_email.sql` (lines 93–108)

**Description**:  
The `generate_order_number()` function is defined as a plain `plpgsql` function without `SECURITY DEFINER` or explicit grants. By default in Supabase, RPC functions are callable by any authenticated user via `supabase.rpc('generate_order_number')`. An attacker can call this function repeatedly to enumerate the order number format and pre-generate valid-looking order numbers, or to exhaust the uniqueness loop.

**Remediation**:  
Restrict the function to the service role or wrap it in a `SECURITY DEFINER` function that checks the caller:

```sql
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;
```

---

#### FINDING A05-3 — LOW: `product_images` and `product_variants` Have Unrestricted Public Read

**File**: `supabase/migrations/20260930000001_product_schema.sql` (lines 80–90)

**Description**:  
```sql
CREATE POLICY "public_read_product_images"
  ON public.product_images FOR SELECT TO public USING (true);

CREATE POLICY "public_read_product_variants"
  ON public.product_variants FOR SELECT TO public USING (true);
```

These policies allow unauthenticated access to all product images and variants, including those belonging to unpublished products (since the `published` filter only applies to the `products` table). An attacker can enumerate all variant SKUs and internal image URLs for products that are not yet publicly listed.

**Remediation**:  
Add a join condition to filter by the parent product's `published` status:

```sql
CREATE POLICY "public_read_product_images"
  ON public.product_images FOR SELECT TO public
  USING (
    product_id IN (SELECT id FROM public.products WHERE published = true)
  );
```

---

### A06 — Vulnerable and Outdated Components

#### FINDING A06-1 — INFO: Deno Standard Library Pinned to Old Version

**File**: `supabase/functions/send-order-confirmation/index.ts` (line 1)

**Description**:  
```typescript
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
```

`deno.land/std@0.192.0` is significantly outdated (current stable is 0.224+). Older versions may contain known vulnerabilities.

**Remediation**:  
Update to the latest stable version of the Deno standard library, or migrate to the Supabase Edge Function native `Deno.serve()` API which does not require this import.

---

### A07 — Identification and Authentication Failures

#### FINDING A07-1 — MEDIUM: No Logout Session Invalidation on Server

**File**: `src/contexts/AuthContext.tsx` (lines 67–70)

**Description**:  
`signOut` calls `supabase.auth.signOut()` which clears the local session. However, Supabase JWTs are stateless — the JWT remains valid until its expiry (typically 1 hour) even after sign-out. If the token was exfiltrated (e.g., via the `localStorage` fallback), the attacker retains access for up to 1 hour after the user signs out.

**Remediation**:  
- Enable Supabase's **Revoke Token on Sign Out** setting in the Auth dashboard.
- Reduce JWT expiry to 15–30 minutes and rely on refresh tokens for session continuity.
- After sign-out, clear all `sb_*` localStorage keys explicitly.

---

#### FINDING A07-2 — LOW: `user_metadata` Used for Display Without Sanitisation

**File**: `src/app/checkout/page.tsx` (lines 82–83)

**Description**:  
```typescript
fullName: user?.user_metadata?.full_name ?? '',
email: user?.email ?? '',
```

`user_metadata` comes from the OAuth provider (Google) and is not sanitised before being placed into form state. While this is a low risk for Google OAuth (Google controls the data), it is worth noting that `user_metadata` can be set by the user via the Supabase client API (`supabase.auth.updateUser`) and is not validated server-side before being used as `customerName` in the order.

**Remediation**:  
In `api/orders/route.ts`, trim and length-limit `customerName` and `customerEmail` before storing them. Consider a maximum length of 255 characters.

---

### A08 — Software and Data Integrity Failures

#### FINDING A08-1 — MEDIUM: No Inventory Decrement on Order Confirmation

**File**: `src/app/api/orders/route.ts` (lines 55–75)

**Description**:  
The API route checks `stock_qty >= item.quantity` before creating the order, but **never decrements `stock_qty`** after the order is created. This means:
- Two concurrent users can both pass the inventory check for the last unit
- Both orders will be created successfully (race condition / overselling)
- `stock_qty` in the database never reflects actual available inventory

**Remediation**:  
Use a database-level atomic decrement with a check:

```sql
UPDATE public.products
SET stock_qty = stock_qty - $quantity
WHERE id = $productId AND stock_qty >= $quantity
RETURNING id;
```

If the UPDATE returns 0 rows, the item is out of stock. Wrap this in the order creation transaction or use a Postgres function.

---

#### FINDING A08-2 — LOW: No CSRF Protection on `/api/orders`

**File**: `src/app/api/orders/route.ts`

**Description**:  
The API route relies on the `Authorization` header (via Supabase session cookie) for authentication but does not validate a CSRF token. With `SameSite=None` cookies (see A02-2), a cross-site request could potentially trigger order creation if the attacker can construct the correct JSON payload.

**Remediation**:  
Add a `X-Requested-With: XMLHttpRequest` check or implement a CSRF token pattern. Next.js Server Actions have built-in CSRF protection — consider migrating order creation to a Server Action.

---

### A09 — Security Logging and Monitoring Failures

#### FINDING A09-1 — MEDIUM: `email_error` Field Leaks Internal Error Strings

**File**: `src/app/orders/[orderId]/confirmation/page.tsx` (lines 90–96)

**Description**:  
```typescript
{process.env.NODE_ENV === 'development' && (
  <p className="text-label-sm text-amber-600 mt-2 font-mono break-all">
    Debug: {typedOrder.email_error}
  </p>
)}
```

The `email_error` field is stored in the database and contains raw error strings from the Resend API (e.g., `"Resend API error 403: {\"message\":\"API key is invalid\",...}"`). While the debug display is gated on `NODE_ENV === 'development'`, the field is still fetched and present in the server-rendered HTML response in production — it is just not rendered. A user inspecting the page source or network response can see the raw error. More critically, if `NODE_ENV` is not set correctly in the deployment environment, the debug block renders in production.

**Remediation**:  
- Do not store raw API error strings in user-facing database records. Store a sanitised error code instead (e.g., `'resend_api_error'`, `'network_timeout'`).
- Remove the debug block entirely; use Supabase Edge Function logs for diagnostics.

---

#### FINDING A09-2 — LOW: Insufficient Server-Side Logging

**File**: `src/app/api/orders/route.ts`

**Description**:  
Failed order attempts (auth failures, inventory failures, validation failures) are returned as HTTP error responses but not logged with sufficient context (user ID, IP, timestamp, attempted product IDs). This makes it difficult to detect brute-force or abuse patterns.

**Remediation**:  
Add structured logging for all error paths including the authenticated user's ID and the request timestamp. Consider integrating with a logging service (Axiom, Datadog, etc.) via Vercel's log drain.

---

### A10 — Server-Side Request Forgery (SSRF)

#### FINDING A10-1 — LOW: Edge Function Fetches Resend API with No URL Validation

**File**: `supabase/functions/send-order-confirmation/index.ts` (line 163)

**Description**:  
The Edge Function fetches a hardcoded URL (`https://api.resend.com/emails`). This is not an SSRF risk in itself. However, the `order.customer_email` value is passed directly to Resend without validation:

```typescript
to: [order.customer_email],
```

If `customer_email` contains a malformed value (e.g., an email with a comment containing a URL), it could potentially be used to probe internal Resend infrastructure. More practically, it enables sending emails to arbitrary addresses.

**Remediation**:  
Validate `customer_email` with a strict regex before passing it to Resend. Ensure the email matches the authenticated user's email from `auth.uid()` (fetched server-side) rather than the client-supplied value.

---

## Summary Table

| ID | Severity | Title | File |
|---|---|---|---|
| A01-1 | 🔴 CRITICAL | Price manipulation via client-supplied `unitPrice` | `api/orders/route.ts` |
| A01-2 | 🟠 HIGH | Open redirect in OAuth callback | `auth/callback/route.ts` |
| A01-3 | 🟠 HIGH | `x-sb-token` header injection in middleware | `middleware.ts` |
| A04-1 | 🟠 HIGH | Orders created as "paid" without payment | `api/orders/route.ts` |
| A05-1 | 🟠 HIGH | Edge Function CORS wildcard + anon key caller | `send-order-confirmation/index.ts` |
| A01-4 | 🟡 MEDIUM | `clearCart` uses client-supplied `user_id` | `CartContext.tsx` |
| A01-5 | 🟡 MEDIUM | `order_items` INSERT policy allows post-confirmation inserts | migration SQL |
| A04-2 | 🟡 MEDIUM | No rate limiting on order creation | `api/orders/route.ts` |
| A05-2 | 🟡 MEDIUM | `generate_order_number` RPC callable by any authenticated user | migration SQL |
| A07-1 | 🟡 MEDIUM | No server-side session invalidation on logout | `AuthContext.tsx` |
| A08-1 | 🟡 MEDIUM | Inventory never decremented — overselling race condition | `api/orders/route.ts` |
| A08-2 | 🟡 MEDIUM | No CSRF protection on `/api/orders` | `api/orders/route.ts` |
| A09-1 | 🟡 MEDIUM | `email_error` leaks internal error strings | `confirmation/page.tsx` |
| A02-1 | 🔵 LOW | Auth token stored in `localStorage` fallback | `supabase/client.ts` |
| A02-2 | 🔵 LOW | `SameSite=None` weakens CSRF posture | `supabase/client.ts` |
| A03-1 | 🔵 LOW | HTML injection in email template | `send-order-confirmation/index.ts` |
| A05-3 | 🔵 LOW | Unpublished product images/variants publicly readable | migration SQL |
| A06-1 | 🔵 INFO | Deno std library pinned to old version | `send-order-confirmation/index.ts` |
| A07-2 | 🔵 LOW | `user_metadata` used without sanitisation | `checkout/page.tsx` |
| A09-2 | 🔵 LOW | Insufficient server-side logging | `api/orders/route.ts` |
| A10-1 | 🔵 LOW | `customer_email` not validated before Resend call | `send-order-confirmation/index.ts` |

---

## Remediation Priority

### Immediate (before any production traffic)
1. **A01-1** — Re-fetch product prices server-side in `api/orders/route.ts`
2. **A01-2** — Validate `next` parameter in `auth/callback/route.ts`
3. **A05-1** — Replace anon key with service-role key for Edge Function call; add shared secret
4. **A08-1** — Implement atomic inventory decrement on order creation

### Short-term (within 1 sprint)
5. **A01-3** — Remove or harden `x-sb-token` header injection in middleware
6. **A04-1** — Set `payment_status: 'pending'` on order creation; add rate limiting
7. **A05-2** — Revoke `generate_order_number` from public/authenticated roles
8. **A09-1** — Sanitise `email_error` before storing; remove debug block

### Medium-term (before scale)
9. **A01-5** — Restrict `order_items` INSERT to server-side only
10. **A07-1** — Enable token revocation; reduce JWT expiry
11. **A08-2** — Add CSRF protection to `/api/orders`
12. **A03-1** — HTML-escape email template variables

---

*This report was produced by automated static analysis of the repository. It does not replace a manual penetration test. Dynamic testing (authenticated API fuzzing, session fixation tests, concurrent request tests for race conditions) should be performed before production launch.*
