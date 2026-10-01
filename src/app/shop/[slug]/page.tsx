import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/product/ProductCard';
import ProductActions from '@/components/product/ProductActions';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  const inStock = product?.stockQty > 0;

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="border-b border-border bg-white">
        <div className="container-content py-3">
          <nav className="flex items-center gap-2 text-label-sm text-fog" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
            {product?.categoryName && (
              <>
                <span>/</span>
                <Link
                  href={`/shop?category=${product?.categorySlug}`}
                  className="hover:text-ink transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-ink line-clamp-1">{product?.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Product Detail ───────────────────────────────────────── */}
      <div className="container-content py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product?.images} productName={product?.name} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* Badge + Category */}
            <div className="flex items-center gap-3">
              {product?.categoryName && (
                <Link
                  href={`/shop?category=${product?.categorySlug}`}
                  className="text-label-sm text-fog hover:text-brass transition-colors"
                >
                  {product.categoryName}
                </Link>
              )}
              {product?.badge && (
                <BadgePill badge={product.badge} />
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-display-lg text-ink leading-tight">
              {product?.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-heading-xl font-semibold text-ink">
                £{product?.basePrice?.toFixed(2)}
              </span>
              {product?.comparePrice && (
                <span className="text-body-lg text-fog line-through">
                  £{product.comparePrice.toFixed(2)}
                </span>
              )}
              {product?.comparePrice && (
                <span className="text-label-sm font-medium text-success bg-success/10 px-2 py-0.5 rounded-sm">
                  Save £{(product.comparePrice - product.basePrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${inStock ? 'bg-success' : 'bg-error'}`}
                aria-hidden="true"
              />
              <span className={`text-label-lg font-medium ${inStock ? 'text-success' : 'text-error'}`}>
                {inStock
                  ? product?.stockQty <= 5
                    ? `Only ${product.stockQty} left`
                    : 'In Stock' :'Out of Stock'}
              </span>
            </div>

            {/* Variants + Add to Cart (client component) */}
            <ProductActions product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mx-auto" aria-hidden="true">
                      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'Secure Checkout',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mx-auto" aria-hidden="true">
                      <path d="M3 12H21M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12L17 8M21 12L17 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'Free Returns',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mx-auto" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: '2-Year Warranty',
                },
              ].map((badge) => (
                <div key={badge.label} className="text-center text-fog">
                  <span className="block mb-1">{badge.icon}</span>
                  <span className="text-label-sm">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product?.description && (
              <div className="pt-2 border-t border-border">
                <h2 className="text-label-lg font-semibold text-ink uppercase tracking-wide mb-3">
                  Description
                </h2>
                <p className="text-body-md text-fog leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────── */}
        {relatedProducts?.length > 0 && (
          <section className="mt-16 md:mt-20 pt-10 border-t border-border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-1">
                  You Might Also Like
                </p>
                <h2 className="font-serif text-display-lg text-ink">Related Products</h2>
              </div>
              {product?.categorySlug && (
                <Link
                  href={`/shop?category=${product.categorySlug}`}
                  className="hidden md:inline-flex text-label-lg font-medium text-brass hover:text-ink transition-colors"
                >
                  View all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts?.map((p) => (
                <ProductCard key={p?.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Badge Pill ───────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-linen text-ink border border-border',
  promo: 'bg-brass text-white',
  favourite: 'bg-slate text-chalk',
  bestseller: 'bg-ink text-chalk',
};

const BADGE_LABELS: Record<string, string> = {
  new: 'New',
  promo: 'Promotion',
  favourite: 'Customer Favourite',
  bestseller: 'Best Seller',
};

function BadgePill({ badge }: { badge: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-label-sm font-medium ${BADGE_STYLES[badge] ?? 'bg-linen text-ink'}`}>
      {BADGE_LABELS[badge] ?? badge}
    </span>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | WarehouseHub' };
  return {
    title: `${product.name} | WarehouseHub`,
    description: product.description ?? `Shop ${product.name} at WarehouseHub.`,
  };
}
