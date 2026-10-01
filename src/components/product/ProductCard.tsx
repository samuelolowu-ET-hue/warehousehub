'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckIcon } from '@heroicons/react/24/outline';
import type { Product, BadgeVariant } from '@/types';
import { useCart } from '@/contexts/CartContext';

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<BadgeVariant, string> = {
  new: 'bg-linen text-ink border border-border',
  promo: 'bg-brass text-white',
  favourite: 'bg-slate text-chalk',
  bestseller: 'bg-ink text-chalk',
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  new: 'New',
  promo: 'Promotion',
  favourite: 'Customer Favourite',
  bestseller: 'Best Seller',
};

function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-sm text-label-sm font-medium ${BADGE_STYLES[variant]}`}
    >
      {BADGE_LABELS[variant]}
    </span>
  );
}

// ─── Color Swatches ───────────────────────────────────────────────────────────

function ColorSwatches({ product }: { product: Product }) {
  const colorVariants = product?.variants?.filter(
    (v) => v.name === 'Colour' && v.hexColor
  );
  if (!colorVariants?.length) return null;

  const visible = colorVariants.slice(0, 4);
  const overflow = colorVariants.length - 4;

  return (
    <div className="flex items-center gap-1">
      {visible.map((v) => (
        <span
          key={v.id}
          title={v.value}
          className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_#DDD9D3]"
          style={{ backgroundColor: v.hexColor ?? '#ccc' }}
        />
      ))}
      {overflow > 0 && (
        <span className="text-label-sm text-fog ml-0.5">+{overflow}</span>
      )}
    </div>
  );
}

// ─── Price Display ────────────────────────────────────────────────────────────

function PriceDisplay({
  basePrice,
  comparePrice,
  dark = false,
}: {
  basePrice: number;
  comparePrice: number | null;
  dark?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-heading-md font-semibold ${dark ? 'text-brass' : 'text-ink'}`}>
        £{basePrice.toFixed(2)}
      </span>
      {comparePrice && (
        <span className={`text-body-sm line-through ${dark ? 'text-fog' : 'text-fog-accessible'}`}>
          £{comparePrice.toFixed(2)}
        </span>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  dark?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, dark = false, priority = false }: ProductCardProps) {
  const primaryImage = product?.images?.[0];
  const hasImage = !!primaryImage?.url;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product, null, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link
      href={`/shop/${product?.slug}`}
      className={`group block rounded-card overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
        dark
          ? 'bg-white/5 border-white/10 hover:border-white/20' :'bg-white border-border'
      }`}
    >
      {/* Image Area */}
      <div
        className={`relative overflow-hidden ${dark ? 'bg-white/10' : 'bg-linen'}`}
        style={{ aspectRatio: '1/1' }}
      >
        {hasImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 64 48" fill="none" className="w-16 h-12 text-border" aria-hidden="true">
              <rect x="4" y="4" width="56" height="40" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M4 16H60M4 28H60" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Badge */}
        {product?.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge} />
          </div>
        )}

        {/* Color Swatches */}
        {product?.variants?.some((v) => v.name === 'Colour' && v.hexColor) && (
          <div className="absolute bottom-3 left-3">
            <ColorSwatches product={product} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Category */}
        {product?.categoryName && (
          <p className={`text-label-sm mb-1 ${dark ? 'text-fog' : 'text-fog-accessible'}`}>
            {product.categoryName}
          </p>
        )}

        {/* Name */}
        <h3
          className={`font-serif text-heading-md mb-1 line-clamp-2 leading-snug ${
            dark ? 'text-chalk' : 'text-ink'
          }`}
        >
          {product?.name}
        </h3>

        {/* Price + CTA Row */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <PriceDisplay
            basePrice={product?.basePrice}
            comparePrice={product?.comparePrice}
            dark={dark}
          />
          <button
            onClick={handleAddToCart}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-label-sm font-medium transition-all duration-150 ${
              added
                ? 'bg-green-600 text-white'
                : dark
                ? 'bg-white/10 text-chalk hover:bg-brass hover:text-ink' :'bg-slate text-chalk hover:bg-brass hover:text-ink'
            }`}
            aria-label={`Add ${product?.name} to cart`}
          >
            {added ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`rounded-card overflow-hidden border animate-pulse ${
        dark ? 'bg-white/5 border-white/10' : 'bg-white border-border'
      }`}
    >
      <div className={`${dark ? 'bg-white/10' : 'bg-linen'}`} style={{ aspectRatio: '1/1' }} />
      <div className="p-4 space-y-2">
        <div className={`h-3 w-16 rounded ${dark ? 'bg-white/10' : 'bg-linen'}`} />
        <div className={`h-5 w-3/4 rounded ${dark ? 'bg-white/10' : 'bg-linen'}`} />
        <div className={`h-5 w-1/2 rounded ${dark ? 'bg-white/10' : 'bg-linen'}`} />
      </div>
    </div>
  );
}
