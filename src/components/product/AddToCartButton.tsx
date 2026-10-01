'use client';

import React, { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { CheckIcon } from '@heroicons/react/24/outline';

interface AddToCartButtonProps {
  product: Product;
  variantId: string | null;
  inStock: boolean;
}

export default function AddToCartButton({ product, variantId, inStock }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!inStock || loading) return;
    setLoading(true);
    try {
      await addItem(product, variantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!inStock || loading}
      className={`flex-1 flex items-center justify-center gap-2 btn-primary py-4 text-body-md disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
        added ? 'bg-green-600 border-green-600' : ''
      }`}
      aria-label={`Add ${product?.name} to cart`}
    >
      {added ? (
        <>
          <CheckIcon className="w-5 h-5" />
          Added to cart
        </>
      ) : loading ? (
        'Adding…'
      ) : inStock ? (
        'Add to Cart'
      ) : (
        'Out of Stock'
      )}
    </button>
  );
}
