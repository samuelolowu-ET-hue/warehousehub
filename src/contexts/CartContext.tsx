'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartLineItem {
  id: string; // cart_items.id (Supabase) or product.id (local)
  product: Product;
  variantId: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (product: Product, variantId?: string | null, qty?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOCAL_KEY = 'wh_guest_cart';

function readLocal(): CartLineItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartLineItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
}

function clearLocal() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {}
}

function calcSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, li) => sum + li.product.basePrice * li.quantity, 0);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue>({
  items: [],
  itemCount: 0,
  subtotal: 0,
  loading: false,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
});

export const useCart = () => useContext(CartContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const mergedRef = useRef(false);

  // ── Load cart ──────────────────────────────────────────────────────────────

  const loadServerCart = useCallback(async (): Promise<CartLineItem[]> => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `id, quantity, variant_id,
         product:products(
           id, name, slug, base_price, compare_price, badge, stock_qty,
           images:product_images(id, url, alt_text, sort_order),
           variants:product_variants(id, name, value, hex_color, price_delta, stock_qty, sku)
         )`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Cart load error:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const p = row.product as Record<string, unknown>;
      const images = ((p.images as Record<string, unknown>[]) ?? []).sort(
        (a, b) => (a.sort_order as number) - (b.sort_order as number)
      );
      const product: Product = {
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        description: null,
        categoryId: null,
        basePrice: Number(p.base_price),
        comparePrice: p.compare_price ? Number(p.compare_price) : null,
        isFeatured: false,
        isNew: false,
        badge: (p.badge as Product['badge']) ?? null,
        stockQty: p.stock_qty as number,
        images: images.map((img) => ({
          id: img.id as string,
          url: img.url as string,
          altText: (img.alt_text as string) ?? '',
        })),
        variants: ((p.variants as Record<string, unknown>[]) ?? []).map((v) => ({
          id: v.id as string,
          name: v.name as string,
          value: v.value as string,
          hexColor: (v.hex_color as string) ?? null,
          priceDelta: Number(v.price_delta ?? 0),
          stockQty: v.stock_qty as number,
          sku: (v.sku as string) ?? null,
        })),
        createdAt: '',
      };
      return {
        id: row.id as string,
        product,
        variantId: (row.variant_id as string) ?? null,
        quantity: row.quantity as number,
      };
    });
  }, [supabase]);

  // ── Merge guest cart into server on login ──────────────────────────────────

  const mergeGuestCart = useCallback(
    async (guestItems: CartLineItem[]) => {
      if (!guestItems.length) return;
      for (const li of guestItems) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user!.id)
          .eq('product_id', li.product.id)
          .is('variant_id', li.variantId ?? null)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + li.quantity })
            .eq('id', existing.id);
        } else {
          await supabase.from('cart_items').insert({
            user_id: user!.id,
            product_id: li.product.id,
            variant_id: li.variantId ?? null,
            quantity: li.quantity,
          });
        }
      }
      clearLocal();
    },
    [supabase, user]
  );

  // ── Effect: load cart when auth state resolves ─────────────────────────────

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setLoading(true);
      const guestItems = readLocal();
      const doLoad = async () => {
        if (!mergedRef.current && guestItems.length > 0) {
          mergedRef.current = true;
          await mergeGuestCart(guestItems);
        }
        const serverItems = await loadServerCart();
        setItems(serverItems);
        setLoading(false);
      };
      doLoad();
    } else {
      mergedRef.current = false;
      setItems(readLocal());
      setLoading(false);
    }
  }, [user, authLoading]);

  // ── Add item ───────────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (product: Product, variantId: string | null = null, qty = 1) => {
      if (user) {
        // Check if already in server cart
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .is('variant_id', variantId ?? null)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + qty })
            .eq('id', existing.id);
          if (error) { console.error(error.message); return; }
          setItems((prev) =>
            prev.map((li) =>
              li.id === existing.id ? { ...li, quantity: existing.quantity + qty } : li
            )
          );
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              variant_id: variantId ?? null,
              quantity: qty,
            })
            .select('id')
            .single();
          if (error) { console.error(error.message); return; }
          setItems((prev) => [
            ...prev,
            { id: data.id, product, variantId, quantity: qty },
          ]);
        }
      } else {
        // Guest: localStorage
        setItems((prev) => {
          const existing = prev.find(
            (li) => li.product.id === product.id && li.variantId === variantId
          );
          let next: CartLineItem[];
          if (existing) {
            next = prev.map((li) =>
              li.product.id === product.id && li.variantId === variantId
                ? { ...li, quantity: li.quantity + qty }
                : li
            );
          } else {
            next = [
              ...prev,
              { id: `${product.id}_${variantId ?? 'default'}`, product, variantId, quantity: qty },
            ];
          }
          writeLocal(next);
          return next;
        });
      }
    },
    [user, supabase]
  );

  // ── Remove item ────────────────────────────────────────────────────────────

  const removeItem = useCallback(
    async (cartItemId: string) => {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId);
        if (error) { console.error(error.message); return; }
        setItems((prev) => prev.filter((li) => li.id !== cartItemId));
      } else {
        setItems((prev) => {
          let next = prev.filter((li) => li.id !== cartItemId);
          writeLocal(next);
          return next;
        });
      }
    },
    [user, supabase]
  );

  // ── Update quantity ────────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(cartItemId);
        return;
      }
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId);
        if (error) { console.error(error.message); return; }
        setItems((prev) =>
          prev.map((li) => (li.id === cartItemId ? { ...li, quantity } : li))
        );
      } else {
        setItems((prev) => {
          let next = prev.map((li) =>
            li.id === cartItemId ? { ...li, quantity } : li
          );
          writeLocal(next);
          return next;
        });
      }
    },
    [user, supabase, removeItem]
  );

  // ── Clear cart ─────────────────────────────────────────────────────────────

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      clearLocal();
    }
    setItems([]);
  }, [user, supabase]);

  const itemCount = items.reduce((sum, li) => sum + li.quantity, 0);
  const subtotal = calcSubtotal(items);

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, loading, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
