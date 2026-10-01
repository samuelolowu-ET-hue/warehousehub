-- ─── Stripe-ready columns on orders ─────────────────────────────────────────
-- These columns are intentionally nullable so the current direct-order flow
-- works unchanged. When Stripe is wired in, populate them from the webhook.
--
--   payment_method      : 'direct' (now) | 'stripe' (later)
--   payment_status      : 'paid' | 'pending' | 'failed' | 'refunded'
--   payment_intent_id   : Stripe PaymentIntent ID (stripe_pi_xxx…)
--   stripe_customer_id  : Stripe Customer ID (cus_xxx…)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method     TEXT NOT NULL DEFAULT 'direct'
    CHECK (payment_method IN ('direct', 'stripe')),
  ADD COLUMN IF NOT EXISTS payment_status     TEXT NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_intent_id  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for future Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id
  ON public.orders(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;
