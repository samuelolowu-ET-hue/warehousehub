// ─── Database Row Types ──────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  compare_price: number | null;
  is_featured: boolean;
  is_new: boolean;
  badge: string | null;
  stock_qty: number;
  published: boolean;
  created_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  value: string;
  hex_color: string | null;
  price_delta: number;
  stock_qty: number;
  sku: string | null;
}

// ─── App-level Types ─────────────────────────────────────────────────────────

export type BadgeVariant = 'new' | 'promo' | 'favourite' | 'bestseller';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  hexColor: string | null;
  priceDelta: number;
  stockQty: number;
  sku: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  categoryName?: string;
  categorySlug?: string;
  basePrice: number;
  comparePrice: number | null;
  isFeatured: boolean;
  isNew: boolean;
  badge: BadgeVariant | null;
  stockQty: number;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface NewsletterFormState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}
