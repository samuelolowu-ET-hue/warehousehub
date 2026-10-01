'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { items, itemCount, subtotal, loading, removeItem, updateQuantity } = useCart();
  const { user, signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try { await signInWithGoogle(); } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container-content py-16">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3]?.map((i) => (
              <div key={i} className="h-24 bg-linen rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div className="bg-slate py-10 md:py-14">
        <div className="container-content">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">
            Your Cart
          </p>
          <h1 className="font-serif text-display-sm text-chalk">
            {itemCount === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
          </h1>
        </div>
      </div>

      <div className="container-content py-10 md:py-16">
        {items?.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <ShoppingBagIcon className="w-16 h-16 text-fog mx-auto mb-6" />
            <h2 className="font-serif text-heading-lg text-ink mb-3">Nothing here yet</h2>
            <p className="text-body-md text-fog mb-8">
              Browse our collection and add items to your cart.
            </p>
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            {!user && (
              <p className="mt-6 text-body-sm text-fog">
                <button onClick={handleSignIn} className="text-brass hover:underline font-medium">
                  Sign in
                </button>{' '}
                to save your cart across devices.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {!user && (
                <div className="bg-linen border border-border rounded-card px-5 py-4 flex items-center justify-between gap-4">
                  <p className="text-body-sm text-ink">
                    <button onClick={handleSignIn} className="text-brass hover:underline font-medium">
                      Sign in
                    </button>{' '}
                    to save your cart and access it from any device.
                  </p>
                </div>
              )}

              {items?.map((li) => {
                const image = li?.product?.images?.[0];
                return (
                  <div
                    key={li?.id}
                    className="card flex gap-4 p-4 md:p-5"
                  >
                    {/* Product image */}
                    <Link href={`/shop/${li?.product?.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-card overflow-hidden bg-linen">
                        {image ? (
                          <Image
                            src={image?.url}
                            alt={image?.altText || li?.product?.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBagIcon className="w-8 h-8 text-fog" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${li?.product?.slug}`}
                        className="font-medium text-body-md text-ink hover:text-brass transition-colors line-clamp-2"
                      >
                        {li?.product?.name}
                      </Link>
                      {li?.variantId && (
                        <p className="text-label-sm text-fog mt-0.5">
                          {li?.product?.variants?.find((v) => v?.id === li?.variantId)?.value ?? ''}
                        </p>
                      )}
                      <p className="text-label-sm font-semibold text-ink mt-1">
                        £{li?.product?.basePrice?.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity stepper */}
                        <div className="flex items-center gap-1 border border-border rounded-btn overflow-hidden">
                          <button
                            onClick={() => updateQuantity(li?.id, li?.quantity - 1)}
                            className="p-1.5 hover:bg-linen transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="w-3.5 h-3.5 text-ink" />
                          </button>
                          <span className="px-3 text-label-sm font-medium text-ink min-w-[2rem] text-center">
                            {li?.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(li?.id, li?.quantity + 1)}
                            className="p-1.5 hover:bg-linen transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="w-3.5 h-3.5 text-ink" />
                          </button>
                        </div>

                        {/* Line total + remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-label-sm font-semibold text-ink">
                            £{(li?.product?.basePrice * li?.quantity)?.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(li?.id)}
                            className="p-1.5 text-fog hover:text-red-500 transition-colors"
                            aria-label={`Remove ${li?.product?.name}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-[calc(var(--navbar-height)+1.5rem)]">
                <h2 className="font-serif text-heading-md text-ink mb-5">Order summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-body-sm text-ink">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span className="font-medium">£{subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-fog">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="divider mb-5" />

                <div className="flex justify-between text-body-lg font-semibold text-ink mb-6">
                  <span>Subtotal (excl. shipping)</span>
                  <span>£{subtotal?.toFixed(2)}</span>
                </div>

                {user ? (
                  <Link href="/checkout" className="btn-primary w-full text-center block">
                    Proceed to checkout
                  </Link>
                ) : (
                  <button onClick={handleSignIn} className="btn-primary w-full">
                    Sign in to checkout
                  </button>
                )}

                <Link
                  href="/shop"
                  className="btn-ghost w-full mt-3 text-center block"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
