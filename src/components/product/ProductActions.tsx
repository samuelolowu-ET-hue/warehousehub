'use client';

import React, { useState } from 'react';
import type { Product } from '@/types';
import VariantSelector from '@/components/product/VariantSelector';
import AddToCartButton from '@/components/product/AddToCartButton';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const inStock = product?.stockQty > 0;

  return (
    <>
      <VariantSelector
        variants={product?.variants}
        basePrice={product?.basePrice}
        onVariantIdChange={(variantId) => setSelectedVariantId(variantId)}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton product={product} variantId={selectedVariantId} inStock={inStock} />
        <button
          className="btn-ghost border-ink text-ink hover:bg-ink hover:text-chalk py-4 px-6"
          aria-label="Save to wishlist"
        >
          ♡
        </button>
      </div>
    </>
  );
}
