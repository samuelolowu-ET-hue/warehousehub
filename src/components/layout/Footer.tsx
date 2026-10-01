'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/shop' },
      { label: 'New Arrivals', href: '/shop?filter=new' },
      { label: 'Bestsellers', href: '/shop?sort=bestseller' },
      { label: 'Storage', href: '/shop?category=storage' },
      { label: 'Organisation', href: '/shop?category=organisation' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', href: '#sign-in' },
      { label: 'Order History', href: '/orders' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Contact Us', href: 'mailto:hello@warehousehub.co.uk' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About WarehouseHub', href: '/about' },
    ],
  },
];

const TRUST_BADGES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Secure Checkout',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M3 12H21M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12L17 8M21 12L17 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Free Returns',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: '2-Year Warranty',
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 16.24 4.56 19.88 8.22 21.44C8.14 20.72 8.08 19.6 8.28 18.8L9.56 13.4C9.56 13.4 9.2 12.68 9.2 11.6C9.2 9.92 10.18 8.66 11.4 8.66C12.42 8.66 12.92 9.42 12.92 10.34C12.92 11.38 12.26 12.94 11.92 14.38C11.64 15.6 12.54 16.6 13.74 16.6C15.92 16.6 17.6 14.28 17.6 10.96C17.6 8.02 15.5 5.98 12.06 5.98C8.1 5.98 5.78 8.92 5.78 11.96C5.78 13 6.14 14.12 6.6 14.72C6.7 14.84 6.72 14.94 6.68 15.08L6.28 16.68C6.22 16.9 6.08 16.96 5.86 16.86C4.28 16.1 3.28 13.86 3.28 11.96C3.28 7.58 6.44 3.54 12.42 3.54C17.2 3.54 20.92 6.96 20.92 11.02C20.92 15.26 18.28 18.66 14.52 18.66C13.28 18.66 12.1 18 11.7 17.22L10.98 19.96C10.72 20.94 10.06 22.18 9.6 22.94C10.38 23.16 11.18 23.28 12 23.28C17.52 23.28 22 18.8 22 13.28C22 7.76 17.52 2 12 2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    // Placeholder — real submission wired in later phase
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 800);
  };

  return (
    <footer className="bg-slate text-chalk" role="contentinfo">
      {/* ── Newsletter ──────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container-content py-14 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-3">
              Join the Community
            </p>
            <h2 className="font-serif text-display-lg text-chalk mb-3">
              Thoughtfully curated, delivered to you
            </h2>
            <p className="text-body-md text-fog mb-8 max-w-md mx-auto">
              New arrivals, storage inspiration, and exclusive offers — straight to your inbox. No clutter, we promise.
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="text-body-md font-medium">You&apos;re on the list — welcome!</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                noValidate
              >
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/10 border border-white/20 rounded-btn px-4 py-3 text-body-md text-chalk placeholder:text-fog outline-none focus:border-brass transition-colors duration-200"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ────────────────────────────────────── */}
      <div className="container-content py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-chalk hover:opacity-80 transition-opacity mb-4" aria-label="WarehouseHub home">
              <WarehouseIconFooter className="w-7 h-7" />
              <span className="font-serif text-heading-md">WarehouseHub</span>
            </Link>
            <p className="text-body-sm text-fog leading-relaxed max-w-xs">
              Premium storage and organisation for considered living. Crafted to last, designed to inspire.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-fog hover:text-chalk hover:bg-white/10 rounded-btn transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-label-lg font-semibold text-chalk uppercase tracking-wider mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-fog hover:text-chalk transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust Badges ────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-content py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2.5 text-fog">
                {badge.icon}
                <span className="text-label-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legal Baseline ──────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-content py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-label-sm text-fog">
            <p>© {new Date().getFullYear()} WarehouseHub. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/legal/privacy" className="hover:text-chalk transition-colors duration-200">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-chalk transition-colors duration-200">Terms of Service</Link>
              <Link href="/legal/cookies" className="hover:text-chalk transition-colors duration-200">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WarehouseIconFooter({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12L14 4L26 12V26H18V18H10V26H2V12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 26V20H18V26"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <rect x="11" y="13" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
