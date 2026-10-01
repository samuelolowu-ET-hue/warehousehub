-- ─── Phase 4 & 5: Orders + Email ─────────────────────────────────────────────

-- 1. orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_total  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  shipping_address JSONB,
  email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  email_error     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 2. order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  variant_name    TEXT,
  sku             TEXT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(10,2) NOT NULL,
  line_total      NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 3. updated_at trigger for orders
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS: orders — users see only their own
DROP POLICY IF EXISTS "users_select_own_orders" ON public.orders;
CREATE POLICY "users_select_own_orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_orders" ON public.orders;
CREATE POLICY "users_insert_own_orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_orders" ON public.orders;
CREATE POLICY "users_update_own_orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. RLS: order_items — users see items for their own orders
DROP POLICY IF EXISTS "users_select_own_order_items" ON public.order_items;
CREATE POLICY "users_select_own_order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "users_insert_own_order_items" ON public.order_items;
CREATE POLICY "users_insert_own_order_items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- 7. Helper function: generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'WH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END;
$$;
