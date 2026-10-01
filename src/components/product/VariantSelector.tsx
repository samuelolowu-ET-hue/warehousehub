'use client';

import React, { useState } from 'react';
import type { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  onVariantChange?: (variant: ProductVariant | null) => void;
  onVariantIdChange?: (variantId: string | null) => void;
}

// Group variants by name
function groupVariants(variants: ProductVariant[]): Record<string, ProductVariant[]> {
  return variants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});
}

export default function VariantSelector({ variants, basePrice, onVariantChange, onVariantIdChange }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (!variants?.length) return null;

  const groups = groupVariants(variants);

  const handleSelect = (groupName: string, variantId: string) => {
    const next = { ...selected, [groupName]: variantId };
    setSelected(next);

    // Find the selected variant for price delta
    const v = variants?.find((v) => v.id === variantId) ?? null;
    onVariantChange?.(v);
    onVariantIdChange?.(variantId);
  };

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([groupName, groupVariants]) => (
        <div key={groupName}>
          <p className="text-label-lg font-semibold text-ink mb-2.5">
            {groupName}
            {selected[groupName] && (
              <span className="font-normal text-fog ml-2">
                — {groupVariants?.find((v) => v.id === selected[groupName])?.value}
              </span>
            )}
          </p>

          {/* Color swatches */}
          {groupVariants?.some((v) => v.hexColor) ? (
            <div className="flex flex-wrap gap-2">
              {groupVariants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(groupName, v.id)}
                  title={v.value}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                    selected[groupName] === v.id
                      ? 'border-brass shadow-[0_0_0_2px_#B5924C]'
                      : 'border-white shadow-[0_0_0_1px_#DDD9D3] hover:shadow-[0_0_0_1px_#9AA3AD]'
                  }`}
                  style={{ backgroundColor: v.hexColor ?? '#ccc' }}
                  aria-label={v.value}
                  aria-pressed={selected[groupName] === v.id}
                />
              ))}
            </div>
          ) : (
            /* Text/size buttons */
            <div className="flex flex-wrap gap-2">
              {groupVariants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(groupName, v.id)}
                  className={`px-4 py-2 rounded-btn border text-label-lg font-medium transition-all duration-150 ${
                    selected[groupName] === v.id
                      ? 'bg-ink text-chalk border-ink' :'bg-white text-ink border-border hover:border-fog'
                  }`}
                  aria-pressed={selected[groupName] === v.id}
                >
                  {v.value}
                  {v.priceDelta !== 0 && (
                    <span className="ml-1 text-body-sm font-normal">
                      {v.priceDelta > 0 ? `+£${v.priceDelta.toFixed(0)}` : `-£${Math.abs(v.priceDelta).toFixed(0)}`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
