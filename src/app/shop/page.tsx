import React, { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard, { ProductCardSkeleton } from '@/components/product/ProductCard';
import ShopFilters from '@/components/product/ShopFilters';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    filter?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params?.search ?? '';
  const category = params?.category ?? '';
  const sort = params?.sort ?? 'newest';
  const filter = params?.filter ?? '';
  const page = Math.max(1, parseInt(params?.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const [productsResult, categories] = await Promise.all([
    getProducts({
      search: search || undefined,
      categorySlug: category || undefined,
      sortBy: sort as any,
      featured: filter === 'featured' ? true : undefined,
      isNew: filter === 'new' ? true : undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    getCategories(),
  ]);

  const { products, total } = productsResult;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-slate py-12 md:py-16">
        <div className="container-content">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">
            {category
              ? categories?.find((c) => c?.slug === category)?.name ?? 'Category'
              : filter === 'new' ?'Just In'
              : filter === 'featured' ?'Most Loved' :'All Products'}
          </p>
          <h1 className="font-serif text-display-lg text-chalk">
            {category
              ? categories?.find((c) => c?.slug === category)?.name ?? 'Products'
              : filter === 'new' ?'New Arrivals'
              : filter === 'featured' ?'Bestsellers' :'Shop'}
          </h1>
        </div>
      </div>

      <div className="container-content py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="md:w-56 lg:w-64 flex-shrink-0">
            <Suspense>
              <ShopFilters
                categories={categories}
                initialSearch={search}
                initialCategory={category}
                initialSort={sort}
                initialFilter={filter}
                totalCount={total}
              />
            </Suspense>
          </aside>

          {/* ── Product Grid ─────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              {products?.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products?.map((product, i) => (
                      <ProductCard key={product?.id} product={product} priority={i < 3} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <a
                          key={p}
                          href={`/shop?${new URLSearchParams({
                            ...(search && { search }),
                            ...(category && { category }),
                            ...(sort && sort !== 'newest' && { sort }),
                            ...(filter && { filter }),
                            page: String(p),
                          }).toString()}`}
                          className={`w-9 h-9 flex items-center justify-center rounded-btn text-label-lg font-medium transition-colors ${
                            p === page
                              ? 'bg-ink text-chalk' :'bg-white border border-border text-ink hover:bg-linen'
                          }`}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 text-border">
                    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                      <rect x="8" y="20" width="48" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 28H56M24 20V12H40V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-heading-xl text-ink mb-2">No products found</h2>
                  <p className="text-body-md text-fog mb-6">
                    {search
                      ? `No results for "${search}". Try a different search term.`
                      : 'No products match your current filters.'}
                  </p>
                  <a href="/shop" className="btn-primary">
                    Clear Filters
                  </a>
                </div>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'Shop | WarehouseHub',
    description: 'Browse our full range of warehouse-grade storage and organisation products.',
  };
}
