'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBagIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

const SUPPORTED_COUNTRIES = [
  'United Kingdom',
  'Ireland',
  'France',
  'Germany',
  'Netherlands',
  'Belgium',
  'Spain',
  'Italy',
  'Portugal',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Austria',
  'Switzerland',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Romania',
  'Bulgaria',
  'Greece',
  'Croatia',
  'Slovakia',
  'Slovenia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Cyprus',
  'United States',
  'Canada',
  'Australia',
  'New Zealand',
];

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = 'Full name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email';
  if (!data.address.trim()) errors.address = 'Address is required';
  if (!data.city.trim()) errors.city = 'City is required';
  if (!data.postcode.trim()) errors.postcode = 'Postcode is required';
  if (!data.country.trim()) errors.country = 'Country is required';
  return errors;
}

export default function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    fullName: user?.user_metadata?.full_name ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user) {
      setServerError('You must be signed in to place an order.');
      return;
    }

    if (items.length === 0) {
      setServerError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.fullName,
          customerEmail: form.email,
          shippingAddress: {
            address: form.address,
            city: form.city,
            postcode: form.postcode,
            country: form.country,
          },
          items: items.map((li) => ({
            productId: li.product.id,
            variantId: li.variantId ?? null,
            quantity: li.quantity,
            unitPrice: li.product.basePrice,
            productName: li.product.name,
            variantName: li.variantId
              ? (li.product.variants?.find((v) => v.id === li.variantId)?.value ?? null)
              : null,
            sku: li.variantId
              ? (li.product.variants?.find((v) => v.id === li.variantId)?.sku ?? null)
              : null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error ?? 'Failed to place order. Please try again.');
        return;
      }

      await clearCart();
      router.push(`/orders/${data.orderId}/confirmation`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container-content py-24 text-center">
          <LockClosedIcon className="w-12 h-12 text-fog mx-auto mb-4" />
          <h1 className="font-serif text-heading-lg text-ink mb-3">Sign in to checkout</h1>
          <p className="text-body-md text-fog mb-8">You need to be signed in to place an order.</p>
          <Link href="/cart" className="btn-primary">Back to cart</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container-content py-24 text-center">
          <ShoppingBagIcon className="w-12 h-12 text-fog mx-auto mb-4" />
          <h1 className="font-serif text-heading-lg text-ink mb-3">Your cart is empty</h1>
          <p className="text-body-md text-fog mb-8">Add some items before checking out.</p>
          <Link href="/shop" className="btn-primary">Shop now</Link>
        </div>
      </div>
    );
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 rounded-btn border text-body-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass transition-colors ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-border'
    }`;

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div className="bg-slate py-10 md:py-14">
        <div className="container-content">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">Checkout</p>
          <h1 className="font-serif text-display-sm text-chalk">Complete your order</h1>
        </div>
      </div>

      <div className="container-content py-10 md:py-16">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Customer info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <div className="card p-6">
                <h2 className="font-serif text-heading-md text-ink mb-5">Contact information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-medium text-ink mb-1.5">Full name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className={inputClass('fullName')}
                    />
                    {errors.fullName && <p className="mt-1 text-label-sm text-red-500">{errors.fullName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-medium text-ink mb-1.5">Email address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="mt-1 text-label-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-medium text-ink mb-1.5">
                      Phone number <span className="text-fog font-normal">(optional — for delivery updates)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+44 7700 900000"
                      className={inputClass('phone')}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="card p-6">
                <h2 className="font-serif text-heading-md text-ink mb-5">Shipping address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-medium text-ink mb-1.5">Street address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Warehouse Lane"
                      className={inputClass('address')}
                    />
                    {errors.address && <p className="mt-1 text-label-sm text-red-500">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-ink mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="London"
                      className={inputClass('city')}
                    />
                    {errors.city && <p className="mt-1 text-label-sm text-red-500">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-label-sm font-medium text-ink mb-1.5">Postcode</label>
                    <input
                      type="text"
                      name="postcode"
                      value={form.postcode}
                      onChange={handleChange}
                      placeholder="EC1A 1BB"
                      className={inputClass('postcode')}
                    />
                    {errors.postcode && <p className="mt-1 text-label-sm text-red-500">{errors.postcode}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-medium text-ink mb-1.5">Country</label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className={inputClass('country')}
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && <p className="mt-1 text-label-sm text-red-500">{errors.country}</p>}
                  </div>
                </div>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-card px-5 py-4">
                  <p className="text-body-sm text-red-700">{serverError}</p>
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-[calc(var(--navbar-height)+1.5rem)]">
                <h2 className="font-serif text-heading-md text-ink mb-5">Order summary</h2>

                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                  {items?.map((li) => {
                    const image = li?.product?.images?.[0];
                    return (
                      <div key={li?.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-card overflow-hidden bg-linen flex-shrink-0">
                          {image ? (
                            <Image
                              src={image?.url}
                              alt={image?.altText || li?.product?.name}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBagIcon className="w-5 h-5 text-fog" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-sm font-medium text-ink line-clamp-2">{li?.product?.name}</p>
                          <p className="text-label-sm text-fog">Qty: {li?.quantity}</p>
                          <p className="text-label-sm font-semibold text-ink">
                            £{(li?.product?.basePrice * li?.quantity)?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="divider mb-4" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-body-sm text-ink">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span className="font-medium">£{subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-fog">
                    <span>Shipping</span>
                    <span className="text-success font-medium">Free</span>
                  </div>
                </div>

                <div className="divider mb-4" />

                <div className="flex justify-between text-body-lg font-semibold text-ink mb-6">
                  <span>Total</span>
                  <span>£{subtotal?.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Placing order…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LockClosedIcon className="w-4 h-4" />
                      Place order
                    </span>
                  )}
                </button>
                <p className="mt-3 text-label-sm text-fog-accessible text-center">
                  Payment collected on delivery or by invoice. No card details required.
                </p>

                <Link href="/cart" className="btn-ghost w-full mt-3 text-center block">
                  Back to cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
