# WarehouseHub — Agent Guidelines

## Project Overview

WarehouseHub is a premium ecommerce storefront for warehouse, storage, and organisation goods. Built with Next.js 15 App Router, TypeScript strict mode, and Tailwind CSS v3.

**Live URL**: https://warehouseh2608.builtwithrocket.new

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v3 + custom design tokens |
| Icons | @heroicons/react v2 |
| Package manager | npm |

---

## Design System

### Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1C1C1E` | Primary text, dark backgrounds |
| `slate` | `#2E3A45` | Navbar, footer, brand anchor |
| `brass` | `#B5924C` | Accent, CTA, highlights |
| `chalk` | `#F5F3EF` | Page background |
| `linen` | `#EDE9E2` | Section alternates, card backgrounds |
| `fog` | `#9AA3AD` | Secondary text, placeholders |
| `border` | `#DDD9D3` | Dividers, borders |
| `success` | `#3D7A5F` | Success states |
| `warning` | `#C97B2E` | Warning states |
| `error` | `#B04040` | Error states |

### Typography

- **Display/Headings**: Instrument Serif (Google Fonts)
- **Body/UI**: Inter variable (Google Fonts)
- Scale: `display-2xl` (56px) → `label-sm` (12px)

### Spacing

4px base unit. All spacing values are multiples of 4px.

### Layout

- Content max-width: `1320px` (class: `container-content`)
- Navbar height: `68px` desktop / `60px` mobile
- Section padding: `section-py` utility class

---

## Folder Structure

```
src/
├── app/
│   ├── (storefront)/          # Public storefront routes
│   ├── (account)/             # Authenticated account routes
│   ├── (auth)/                # Auth routes (login, register)
│   ├── api/                   # API route handlers
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── components/
│   ├── ui/                    # Primitive UI components (Button, Input, etc.)
│   ├── product/               # Product-specific components
│   ├── cart/                  # Cart components
│   ├── checkout/              # Checkout components
│   ├── layout/                # Navbar, Footer, layout shells
│   └── homepage/              # Homepage section components
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities, helpers, API clients
│   └── supabase/              # Supabase client (Phase 2+)
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared types
└── styles/
    ├── index.css              # DO NOT EDIT — platform CSS
    └── tailwind.css           # Global styles, design tokens, utilities
```

---

## Path Aliases

```typescript
@/components/*  →  src/components/*
@/lib/*         →  src/lib/*
@/types/*       →  src/types/*
@/hooks/*       →  src/hooks/*
@/*             →  src/*
```

---

## Component Conventions

### Naming
- Components: `PascalCase` (e.g. `ProductCard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g. `useCart.ts`)
- Utilities: `camelCase` (e.g. `formatPrice.ts`)

### Client vs Server Components
- Default to **Server Components** unless interactivity is required
- Add `'use client'` directive only when using: `useState`, `useEffect`, event handlers, browser APIs

### Styling
- Use Tailwind utility classes
- Use design token classes (`text-ink`, `bg-chalk`, `text-brass`, etc.)
- Use component utilities from `tailwind.css` (`btn-primary`, `card`, `container-content`, etc.)
- Avoid inline styles except for CSS custom properties

---

## Button Variants

```tsx
<button className="btn-primary">Primary CTA</button>   // Brass fill, Ink text
<button className="btn-secondary">Secondary</button>   // Slate fill, Chalk text
<button className="btn-ghost">Ghost</button>           // Ink border, transparent
```

---

## Badge Variants

```tsx
<span className="badge-new">New</span>
<span className="badge-promo">Sale</span>
<span className="badge-favourite">Customer Favourite</span>
<span className="badge-bestseller">Best Seller</span>
```

---

## Phase Roadmap

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | ✅ Complete | Foundation: layout, nav, footer, design system |
| Phase 2 | Pending | Product catalogue, PDP, collections |
| Phase 3 | Pending | Cart, checkout, Stripe |
| Phase 4 | Pending | Authentication, account, Supabase |
| Phase 5 | Pending | Orders, Mailgun, admin |

---

## Do NOT Implement (Reserved for Later Phases)

- Checkout flow
- Authentication / Supabase
- Mailgun / email
- Order management
- Stripe integration
- Advanced product filtering

---

## Code Quality

- TypeScript strict mode is enabled — no `any` types
- All components must have proper TypeScript interfaces
- Use optional chaining: `data?.property?.value`
- Array safety: `array?.map?.(() => {})`
- No browser APIs in render — wrap in `useEffect`
- No `Date.now()` / `Math.random()` in render

---

## ESLint & Prettier

Run before committing:
```bash
npm run lint
npm run type-check
npm run format
```
