-- ─── Phase 3: Auth & Cart ────────────────────────────────────────────────────
-- Creates user_profiles (auto-populated via trigger) and cart_items with RLS.

-- 1. user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- 2. cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product_variant
  ON public.cart_items (user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- 3. Trigger function: auto-create user_profiles on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Trigger: fires after new auth user created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. updated_at trigger for cart_items
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cart_items_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 8. RLS Policies: cart_items (authenticated users own their rows)
DROP POLICY IF EXISTS "users_select_own_cart_items" ON public.cart_items;
CREATE POLICY "users_select_own_cart_items"
  ON public.cart_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_cart_items" ON public.cart_items;
CREATE POLICY "users_insert_own_cart_items"
  ON public.cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_cart_items" ON public.cart_items;
CREATE POLICY "users_update_own_cart_items"
  ON public.cart_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_cart_items" ON public.cart_items;
CREATE POLICY "users_delete_own_cart_items"
  ON public.cart_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
