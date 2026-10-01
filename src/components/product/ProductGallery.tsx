'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images?.[activeIndex];

  if (!images?.length) {
    return (
      <div className="aspect-square bg-linen rounded-card flex items-center justify-center">
        <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 text-border" aria-hidden="true">
          <rect x="8" y="20" width="48" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 28H56M24 20V12H40V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-linen rounded-card overflow-hidden">
        <Image
          src={activeImage?.url ?? ''}
          alt={activeImage?.altText ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images?.map((img, i) => (
            <button
              key={img?.id}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all duration-150 ${
                i === activeIndex
                  ? 'border-brass' :'border-border hover:border-fog'
              }`}
              aria-label={img?.altText ? `${productName} — ${img.altText}` : `${productName} — view ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <Image
                src={img?.url}
                alt={img?.altText ?? `${productName} view ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
