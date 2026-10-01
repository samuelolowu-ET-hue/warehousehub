'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/shop?filter=new' },
  { label: 'Bestsellers', href: '/shop?sort=bestseller' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Close account menu on outside click
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handler = () => setAccountMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setAccountMenuOpen(false);
      setDrawerOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  const navBg = scrolled ? 'bg-slate shadow-nav' : 'bg-transparent';
  const textColor = 'text-chalk';
  const logoColor = 'text-chalk';

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${navBg}`}
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="container-content h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 flex-shrink-0 ${logoColor} hover:opacity-80 transition-opacity duration-200`}
            aria-label="WarehouseHub home"
          >
            <WarehouseIcon className="w-7 h-7" />
            <span className="font-serif text-heading-md tracking-tight">WarehouseHub</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-label-lg font-medium rounded-btn transition-all duration-200 hover:bg-white/10 ${textColor}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search pill */}
            <div className="relative">
              {searchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = searchQuery.trim();
                    if (q) {
                      setSearchOpen(false);
                      setSearchQuery('');
                      router.push(`/shop?search=${encodeURIComponent(q)}`);
                    }
                  }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-border rounded-pill px-4 py-2 animate-fade-in"
                >
                  <MagnifyingGlassIcon className={`w-4 h-4 flex-shrink-0 ${textColor}`} />
                  <input
                    type="search"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-transparent border-none outline-none text-body-sm w-48 placeholder:text-fog ${textColor}`}
                    autoFocus
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className={`${textColor} hover:opacity-70 transition-opacity`}
                    aria-label="Close search"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`flex items-center gap-2 border border-border/60 rounded-pill px-4 py-2 text-label-sm transition-all duration-200 hover:bg-white/10 ${textColor}`}
                  aria-label="Open search"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Search</span>
                </button>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative p-2 rounded-btn transition-all duration-200 hover:bg-white/10 ${textColor}`}
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brass text-white text-label-sm rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {authLoading ? (
              <div className={`p-2 ${textColor} opacity-50`}>
                <UserIcon className="w-5 h-5" />
              </div>
            ) : user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 p-2 rounded-btn transition-all duration-200 hover:bg-white/10 ${textColor}`}
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name ?? 'Account'}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-border rounded-card shadow-card-hover z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-label-sm font-medium text-ink truncate">
                        {user.user_metadata?.full_name ?? 'My Account'}
                      </p>
                      <p className="text-label-sm text-fog truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-body-sm text-ink hover:bg-linen transition-colors"
                    >
                      <ShoppingBagIcon className="w-4 h-4 text-fog" />
                      My orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-body-sm text-ink hover:bg-linen transition-colors border-t border-border"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-fog" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className={`flex items-center gap-2 px-4 py-2 text-label-sm font-medium rounded-btn border border-border/60 transition-all duration-200 hover:bg-white/10 ${textColor}`}
              >
                <UserIcon className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href="/cart"
              className={`relative p-2 rounded-btn transition-all duration-200 hover:bg-white/10 ${textColor}`}
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brass text-white text-label-sm rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className={`p-2 rounded-btn transition-all duration-200 hover:bg-white/10 ${textColor}`}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/50 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-slate flex flex-col animate-slide-in-left">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <Link
                href="/"
                className="flex items-center gap-2 text-chalk"
                onClick={() => setDrawerOpen(false)}
              >
                <WarehouseIcon className="w-6 h-6" />
                <span className="font-serif text-heading-md">WarehouseHub</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-chalk hover:bg-white/10 rounded-btn transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem('drawerSearch') as HTMLInputElement)?.value?.trim();
                  if (input) {
                    setDrawerOpen(false);
                    router.push(`/shop?search=${encodeURIComponent(input)}`);
                  }
                }}
              >
                <div className="flex items-center gap-3 bg-white/10 rounded-pill px-4 py-2.5">
                  <MagnifyingGlassIcon className="w-4 h-4 text-fog flex-shrink-0" />
                  <input
                    type="search"
                    name="drawerSearch"
                    placeholder="Search products…"
                    className="bg-transparent border-none outline-none text-body-sm text-chalk placeholder:text-fog w-full"
                  />
                </div>
              </form>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3.5 text-chalk text-body-lg font-medium rounded-btn hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                  <ChevronDownIcon className="w-4 h-4 text-fog -rotate-90" />
                </Link>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-white/10">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name ?? 'Account'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-chalk" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-chalk text-label-sm font-medium truncate">
                        {user.user_metadata?.full_name ?? 'My Account'}
                      </p>
                      <p className="text-fog text-label-sm truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 text-chalk hover:text-brass transition-colors duration-200 text-body-sm"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                  <Link
                    href="/orders"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 text-chalk hover:text-brass transition-colors duration-200 text-body-sm"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    My orders
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => { setDrawerOpen(false); handleSignIn(); }}
                  className="w-full flex items-center gap-3 text-chalk hover:text-brass transition-colors duration-200"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-label-lg font-medium">Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Warehouse Icon SVG ──────────────────────────────────────────────────────

function WarehouseIcon({ className }: { className?: string }) {
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
