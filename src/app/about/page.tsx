import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div className="bg-slate py-12 md:py-16">
        <div className="container-content">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="font-serif text-display-lg text-chalk">About WarehouseHub</h1>
        </div>
      </div>

      <div className="container-content py-16 md:py-24 max-w-3xl">
        <p className="text-label-sm font-medium text-brass-accessible uppercase tracking-widest mb-4">Our Philosophy</p>
        <h2 className="font-serif text-display-sm text-ink mb-6">Storage that earns its place</h2>
        <p className="text-body-lg text-fog leading-relaxed mb-6">
          WarehouseHub was founded on a simple belief: the best storage disappears into your space — until you need it. We source and design products that work harder and look better over time.
        </p>
        <p className="text-body-lg text-fog leading-relaxed mb-6">
          Every product in our collection is chosen for its durability, considered design, and honest materials. No fast furniture, no compromises.
        </p>
        <p className="text-body-lg text-fog leading-relaxed mb-10">
          We back everything we sell with a 2-year warranty because we believe in what we make.
        </p>
        <Link href="/shop" className="btn-primary">
          Shop the Collection
        </Link>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'About | WarehouseHub',
    description: 'Learn about WarehouseHub — premium storage and organisation for considered living.',
  };
}
