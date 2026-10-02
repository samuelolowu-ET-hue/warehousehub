import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getNewProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: 'var(--navbar-height)' }}>
      
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
          aria-hidden="true"
        />
      </div>

      {/* Deep cinematic gradient — bottom-heavy for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/80" />

      {/* Subtle warm vignette from sides */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate/40 via-transparent to-slate/40" />

      {/* Brass cross-hatch texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B5924C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      
      <div className="relative container-content text-center py-24">
        <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-6 hero-text-shadow"
           style={{ fontFamily: 'var(--font-ui)' }}>
          Premium Storage &amp; Organisation
        </p>
        <h1 className="font-serif text-display-2xl text-chalk mb-6 max-w-4xl mx-auto leading-tight hero-text-shadow">
          A place for everything,{' '}
          <em className="not-italic text-brass">beautifully</em> considered
        </h1>
        <p className="text-body-lg text-chalk max-w-xl mx-auto mb-10 hero-text-shadow">
          Warehouse-grade storage solutions with an editorial eye. Built to last, designed to inspire the spaces you live and work in.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop" className="btn-primary text-body-md px-8 py-4">
            Shop the Collection
          </Link>
          <Link
            href="/shop"
            className="btn-ghost border-chalk text-chalk hover:bg-chalk hover:text-ink text-body-md px-8 py-4">
            Browse Categories
          </Link>
        </div>
      </div>
    </section>);

}

// ─── Bestsellers Section ──────────────────────────────────────────────────────

function BestsellersSection({ products }: {products: Product[];}) {
  return (
    <section className="bg-chalk section-py">
      <div className="container-content">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-label-sm font-medium text-brass-accessible uppercase tracking-widest mb-2">
              Most Loved
            </p>
            <h2 className="font-serif text-display-lg text-ink">Bestsellers</h2>
          </div>
          <Link
            href="/shop?sort=bestseller"
            className="hidden md:inline-flex text-label-lg font-medium text-brass-accessible hover:text-ink transition-colors duration-200">
            
            More products →
          </Link>
        </div>

        {products?.length > 0 ?
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products?.map((product, i) =>
          <ProductCard key={product?.id} product={product} priority={i < 2} />
          )}
          </div> :

        <p className="text-body-md text-fog text-center py-12">No featured products yet.</p>
        }

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </div>
    </section>);

}

// ─── Feature Split ────────────────────────────────────────────────────────────

function FeatureSplit() {
  return (
    <section className="bg-linen section-py">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-border">
            <Image
              src="https://images.unsplash.com/photo-1514443031610-8c063c7a9822"
              alt="Organised workshop with steel shelving and tools neatly arranged"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw" />
            
          </div>
          <div>
            <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-4">
              Our Philosophy
            </p>
            <h2 className="font-serif text-display-lg text-ink mb-6">
              Storage that earns its place
            </h2>
            <p className="text-body-lg text-fog mb-8 leading-relaxed">
              Every product in our collection is chosen for its ability to work harder and look better over time. We believe the best storage disappears into your space — until you need it.
            </p>
            <Link href="/shop" className="btn-secondary">
              Shop the Collection
            </Link>
          </div>
        </div>
      </div>
    </section>);

}

// ─── Categories Section ───────────────────────────────────────────────────────

function CategoriesSection({ categories }: {categories: Category[];}) {
  const display = categories?.slice(0, 4);

  return (
    <section className="bg-chalk section-py">
      <div className="container-content">
        <div className="text-center mb-10">
          <p className="text-label-sm font-medium text-brass-accessible uppercase tracking-widest mb-2">
            Browse
          </p>
          <h2 className="font-serif text-display-lg text-ink">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {display?.map((cat) =>
          <Link
            key={cat?.id}
            href={`/shop?category=${cat?.slug}`}
            className="group relative aspect-square rounded-card overflow-hidden">
            
              {cat?.imageUrl ?
            <Image
              src={cat.imageUrl}
              alt={`${cat.name} storage products`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw" /> :


            <div className="absolute inset-0 bg-linen" />
            }
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <span className="font-serif text-heading-md text-chalk block">{cat?.name}</span>
                <span className="text-label-sm text-chalk/70 mt-0.5 block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Shop now →
                </span>
              </div>
            </Link>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="btn-ghost border-ink text-ink hover:bg-ink hover:text-chalk">
            View All Categories
          </Link>
        </div>
      </div>
    </section>);

}

// ─── New Arrivals Section ─────────────────────────────────────────────────────

function NewArrivalsSection({ products }: {products: Product[];}) {
  return (
    <section className="bg-slate section-py">
      <div className="container-content">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">
              Just In
            </p>
            <h2 className="font-serif text-display-lg text-chalk">New Arrivals</h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="hidden md:inline-flex btn-ghost border-chalk text-chalk hover:bg-chalk hover:text-ink">
            
            View All
          </Link>
        </div>

        {products?.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) =>
          <ProductCard key={product?.id} product={product} dark />
          )}
          </div> :

        <p className="text-body-md text-fog text-center py-12">No new arrivals yet.</p>
        }

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop?filter=new" className="btn-ghost border-chalk text-chalk hover:bg-chalk hover:text-ink">
            See All New Arrivals
          </Link>
        </div>
      </div>
    </section>);

}

// ─── Social Proof ─────────────────────────────────────────────────────────────

function SocialProof() {
  const reviews = [
  {
    quote: 'Transformed our garage completely. The shelving is incredibly sturdy and looks beautiful.',
    author: 'Sarah M.',
    location: 'London'
  },
  {
    quote: 'Finally a storage brand that takes design seriously. Every piece feels considered and premium.',
    author: 'James T.',
    location: 'Edinburgh'
  },
  {
    quote: 'The 2-year warranty gave me confidence. Two years in and everything still looks brand new.',
    author: 'Priya K.',
    location: 'Manchester'
  }];


  return (
    <section className="bg-linen section-py">
      <div className="container-content">
        <div className="text-center mb-10">
          <p className="text-label-sm font-medium text-brass-accessible uppercase tracking-widest mb-2">
            Customer Stories
          </p>
          <h2 className="font-serif text-display-lg text-ink">What our customers say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews?.map((review, i) =>
          <div key={i} className="bg-chalk rounded-card p-6 shadow-card">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 })?.map((_, s) =>
              <svg key={s} viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-brass" aria-hidden="true">
                    <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" />
                  </svg>
              )}
              </div>
              <p className="text-body-md text-ink italic mb-4 leading-relaxed">&ldquo;{review?.quote}&rdquo;</p>
              <p className="text-label-lg font-medium text-ink">{review?.author}</p>
              <p className="text-label-sm text-fog">{review?.location}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

// ─── Brand Mission ────────────────────────────────────────────────────────────

function BrandMission() {
  return (
    <section className="bg-chalk section-py">
      <div className="container-content text-center max-w-3xl mx-auto">
        <p className="text-label-sm font-medium text-brass-accessible uppercase tracking-widest mb-6">
          Our Mission
        </p>
        <h2 className="font-serif text-display-xl text-ink mb-6">Built for the long haul</h2>
        <p className="text-body-lg text-fog leading-relaxed mb-10">
          We source and design storage solutions that earn their place in your home or workspace. No fast furniture, no compromises — just honest materials, considered design, and products that improve with age.
        </p>
        <Link href="/shop" className="btn-secondary">
          Shop WarehouseHub
        </Link>
      </div>
    </section>);

}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featuredProducts, newProducts, categories] = await Promise.all([
  getFeaturedProducts(4),
  getNewProducts(3),
  getCategories()]
  );

  return (
    <>
      <Hero />
      <BestsellersSection products={featuredProducts} />
      <FeatureSplit />
      <CategoriesSection categories={categories} />
      <NewArrivalsSection products={newProducts} />
      <SocialProof />
      <BrandMission />
    </>);

}