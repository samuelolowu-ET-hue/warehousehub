-- WarehouseHub Phase 2: Product Schema
-- Migration: 20260930000001_product_schema.sql

-- ─── Categories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  base_price    NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  is_featured   BOOLEAN DEFAULT FALSE,
  is_new        BOOLEAN DEFAULT FALSE,
  badge         TEXT,
  stock_qty     INT NOT NULL DEFAULT 0,
  published     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Images ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INT DEFAULT 0
);

-- ─── Product Variants ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  value       TEXT NOT NULL,
  hex_color   TEXT,
  price_delta NUMERIC(10,2) DEFAULT 0,
  stock_qty   INT NOT NULL DEFAULT 0,
  sku         TEXT UNIQUE
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Full-text search index on products
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- ─── Enable RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: Public read, no public write ───────────────────────────────
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
  ON public.products FOR SELECT TO public USING (published = true);

DROP POLICY IF EXISTS "public_read_product_images" ON public.product_images;
CREATE POLICY "public_read_product_images"
  ON public.product_images FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_product_variants" ON public.product_variants;
CREATE POLICY "public_read_product_variants"
  ON public.product_variants FOR SELECT TO public USING (true);
