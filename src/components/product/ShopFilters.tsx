'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Category } from '@/types';

interface ShopFiltersProps {
  categories: Category[];
  initialSearch: string;
  initialCategory: string;
  initialSort: string;
  initialFilter: string;
  totalCount: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
];

export default function ShopFilters({
  categories,
  initialSearch,
  initialCategory,
  initialSort,
  initialFilter,
  totalCount,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 on filter change
      params.delete('page');
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search });
  };

  const handleCategoryChange = (slug: string) => {
    updateParams({ category: slug });
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  const handleFilterChange = (value: string) => {
    const current = initialFilter === value ? '' : value;
    updateParams({ filter: current });
    setMobileFiltersOpen(false);
  };

  const clearAll = () => {
    router.push('/shop');
    setSearch('');
  };

  const hasActiveFilters = !!(initialSearch || initialCategory || initialFilter);

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-btn bg-white text-body-md text-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass transition-colors"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={initialSort || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-border rounded-btn px-3 py-2.5 text-label-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brass/30 focus:border-brass transition-colors"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 border border-border rounded-btn px-3 py-2.5 text-label-lg text-ink bg-white"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* ── Results count + active filters ──────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-body-sm text-fog">
          {totalCount} {totalCount === 1 ? 'product' : 'products'}
          {initialSearch ? ` for "${initialSearch}"` : ''}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-label-sm text-brass hover:text-ink transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Desktop Sidebar Filters ──────────────────────────────── */}
      <div className="hidden md:block">
        <FilterPanel
          categories={categories}
          activeCategory={initialCategory}
          activeFilter={initialFilter}
          onCategoryChange={handleCategoryChange}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-chalk flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-heading-md text-ink">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-ink hover:text-brass transition-colors"
                aria-label="Close filters"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterPanel
                categories={categories}
                activeCategory={initialCategory}
                activeFilter={initialFilter}
                onCategoryChange={handleCategoryChange}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  categories: Category[];
  activeCategory: string;
  activeFilter: string;
  onCategoryChange: (slug: string) => void;
  onFilterChange: (value: string) => void;
}

function FilterPanel({
  categories,
  activeCategory,
  activeFilter,
  onCategoryChange,
  onFilterChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-label-lg font-semibold text-ink uppercase tracking-wide mb-3">
          Category
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange('')}
              className={`w-full text-left px-3 py-2 rounded-btn text-body-sm transition-colors ${
                !activeCategory
                  ? 'bg-ink text-chalk font-medium' :'text-ink hover:bg-linen'
              }`}
            >
              All Products
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat?.id}>
              <button
                onClick={() => onCategoryChange(cat?.slug)}
                className={`w-full text-left px-3 py-2 rounded-btn text-body-sm transition-colors ${
                  activeCategory === cat?.slug
                    ? 'bg-ink text-chalk font-medium' :'text-ink hover:bg-linen'
                }`}
              >
                {cat?.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-label-lg font-semibold text-ink uppercase tracking-wide mb-3">
          Filter
        </h3>
        <ul className="space-y-1">
          {[
            { value: 'new', label: 'New Arrivals' },
            { value: 'featured', label: 'Bestsellers' },
          ].map((f) => (
            <li key={f.value}>
              <button
                onClick={() => onFilterChange(f.value)}
                className={`w-full text-left px-3 py-2 rounded-btn text-body-sm transition-colors ${
                  activeFilter === f.value
                    ? 'bg-ink text-chalk font-medium' :'text-ink hover:bg-linen'
                }`}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
