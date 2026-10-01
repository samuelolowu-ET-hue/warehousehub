import { createClient } from '@/lib/supabase/server';
import type {
  Product,
  Category,
  ProductRow,
  CategoryRow,
  ProductImageRow,
  ProductVariantRow,
  BadgeVariant,
} from '@/types';

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapProduct(
  row: ProductRow,
  images: ProductImageRow[],
  variants: ProductVariantRow[],
  category?: CategoryRow | null
): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    categoryName: category?.name ?? undefined,
    categorySlug: category?.slug ?? undefined,
    basePrice: Number(row.base_price),
    comparePrice: row.compare_price ? Number(row.compare_price) : null,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    badge: row.badge as BadgeVariant | null,
    stockQty: row.stock_qty,
    images: images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text ?? img.url,
      })),
    variants: variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      hexColor: v.hex_color,
      priceDelta: Number(v.price_delta),
      stockQty: v.stock_qty,
      sku: v.sku,
    })),
    createdAt: row.created_at,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
  };
}

// ─── Category Queries ────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getCategories error:', error.message);
    return [];
  }
  return (data ?? []).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getCategoryBySlug error:', error.message);
    return null;
  }
  return data ? mapCategory(data) : null;
}

// ─── Product Queries ─────────────────────────────────────────────────────────

interface GetProductsOptions {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  limit?: number;
  offset?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<{
  products: Product[];
  total: number;
}> {
  const supabase = await createClient();
  const { categorySlug, featured, isNew, search, sortBy, limit = 20, offset = 0 } = options;

  // Build base query with joins
  let query = supabase
    .from('products')
    .select(
      `
      *,
      categories!products_category_id_fkey(id, name, slug, description, image_url, parent_id, sort_order, created_at),
      product_images(id, product_id, url, alt_text, sort_order),
      product_variants(id, product_id, name, value, hex_color, price_delta, stock_qty, sku)
    `,
      { count: 'exact' }
    )
    .eq('published', true);

  // Category filter via join
  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  if (isNew !== undefined) {
    query = query.eq('is_new', isNew);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('base_price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('getProducts error:', error.message);
    return { products: [], total: 0 };
  }

  const products = (data ?? []).map((row: any) =>
    mapProduct(
      row as ProductRow,
      (row.product_images ?? []) as ProductImageRow[],
      (row.product_variants ?? []) as ProductVariantRow[],
      row.categories as CategoryRow | null
    )
  );

  return { products, total: count ?? 0 };
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const { products } = await getProducts({ featured: true, limit });
  return products;
}

export async function getNewProducts(limit = 3): Promise<Product[]> {
  const { products } = await getProducts({ isNew: true, limit });
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      categories!products_category_id_fkey(id, name, slug, description, image_url, parent_id, sort_order, created_at),
      product_images(id, product_id, url, alt_text, sort_order),
      product_variants(id, product_id, name, value, hex_color, price_delta, stock_qty, sku)
    `
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('getProductBySlug error:', error.message);
    return null;
  }
  if (!data) return null;

  return mapProduct(
    data as ProductRow,
    (data.product_images ?? []) as ProductImageRow[],
    (data.product_variants ?? []) as ProductVariantRow[],
    data.categories as CategoryRow | null
  );
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      categories!products_category_id_fkey(id, name, slug, description, image_url, parent_id, sort_order, created_at),
      product_images(id, product_id, url, alt_text, sort_order),
      product_variants(id, product_id, name, value, hex_color, price_delta, stock_qty, sku)
    `
    )
    .eq('category_id', categoryId)
    .eq('published', true)
    .neq('id', productId)
    .limit(limit);

  if (error) {
    console.error('getRelatedProducts error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) =>
    mapProduct(
      row as ProductRow,
      (row.product_images ?? []) as ProductImageRow[],
      (row.product_variants ?? []) as ProductVariantRow[],
      row.categories as CategoryRow | null
    )
  );
}
