-- WarehouseHub Phase 2: Product Seed Data
-- Migration: 20260930000002_product_seed.sql
-- Representative warehouse/storage/organisation products

DO $$
DECLARE
  -- Category IDs
  cat_shelving      UUID := gen_random_uuid();
  cat_boxes         UUID := gen_random_uuid();
  cat_hooks         UUID := gen_random_uuid();
  cat_workbench     UUID := gen_random_uuid();
  cat_containers    UUID := gen_random_uuid();
  cat_wall_storage  UUID := gen_random_uuid();

  -- Product IDs
  p1  UUID := gen_random_uuid();
  p2  UUID := gen_random_uuid();
  p3  UUID := gen_random_uuid();
  p4  UUID := gen_random_uuid();
  p5  UUID := gen_random_uuid();
  p6  UUID := gen_random_uuid();
  p7  UUID := gen_random_uuid();
  p8  UUID := gen_random_uuid();
  p9  UUID := gen_random_uuid();
  p10 UUID := gen_random_uuid();
  p11 UUID := gen_random_uuid();
  p12 UUID := gen_random_uuid();
  p13 UUID := gen_random_uuid();
  p14 UUID := gen_random_uuid();
  p15 UUID := gen_random_uuid();
  p16 UUID := gen_random_uuid();

BEGIN

  -- ─── Categories ────────────────────────────────────────────────────────────
  INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
    (cat_shelving,     'Shelving',        'shelving',      'Heavy-duty and modular shelving systems for garage, workshop, and home storage', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 1),
    (cat_boxes,        'Boxes & Bins',    'boxes-bins',    'Stackable storage boxes, bins, and crates for organised spaces', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 2),
    (cat_hooks,        'Hooks & Rails',   'hooks-rails',   'Wall-mounted hooks, rails, and pegboards for tools and accessories', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 3),
    (cat_workbench,    'Workbench',       'workbench',     'Professional workbenches and workshop furniture', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 4),
    (cat_containers,   'Containers',      'containers',    'Airtight containers, jars, and organisers for pantry and workspace', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 5),
    (cat_wall_storage, 'Wall Storage',    'wall-storage',  'Floating shelves, wall panels, and mounted storage solutions', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 6)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Products ──────────────────────────────────────────────────────────────
  INSERT INTO public.products (id, name, slug, description, category_id, base_price, compare_price, is_featured, is_new, badge, stock_qty, published) VALUES
    -- Shelving
    (p1,  'Pro Steel Shelving Unit 5-Tier',
          'pro-steel-shelving-unit-5-tier',
          'Industrial-grade steel shelving with adjustable tiers. Holds up to 250kg per shelf. Powder-coated finish resists rust and corrosion. Ideal for garage, workshop, or utility room storage.',
          cat_shelving, 189.00, 229.00, true, false, 'bestseller', 47, true),

    (p2,  'Modular Cube Shelving System',
          'modular-cube-shelving-system',
          'Versatile cube shelving that adapts to any space. Mix and match units to create your perfect configuration. Solid MDF construction with a warm walnut veneer finish.',
          cat_shelving, 149.00, NULL, true, false, 'favourite', 23, true),

    (p3,  'Floating Wall Shelf Set of 3',
          'floating-wall-shelf-set-of-3',
          'Clean-lined floating shelves in three sizes. Invisible bracket system creates a seamless look. Solid pine with a natural oil finish. Weight capacity 15kg per shelf.',
          cat_wall_storage, 79.00, 99.00, false, true, 'new', 61, true),

    (p4,  'Heavy-Duty Garage Shelving 4-Tier',
          'heavy-duty-garage-shelving-4-tier',
          'Built for serious storage. Zinc-plated steel construction with reinforced corner braces. Each tier holds 300kg. Quick assembly with no tools required.',
          cat_shelving, 219.00, NULL, false, true, 'new', 18, true),

    -- Boxes & Bins
    (p5,  'Stackable Storage Box Set of 6',
          'stackable-storage-box-set-of-6',
          'Interlocking storage boxes with secure clip lids. Made from recycled polypropylene. Transparent sides for easy identification. Nesting design saves space when empty.',
          cat_boxes, 59.00, 79.00, true, false, 'promo', 94, true),

    (p6,  'Canvas Storage Bin Large',
          'canvas-storage-bin-large',
          'Structured canvas bin with leather handles and a removable cotton liner. Collapses flat when not in use. Perfect for blankets, toys, or laundry.',
          cat_boxes, 45.00, NULL, false, false, 'favourite', 38, true),

    (p7,  'Industrial Wire Basket Set of 3',
          'industrial-wire-basket-set-of-3',
          'Powder-coated wire baskets in three graduated sizes. Open weave design for ventilation. Stackable with anti-slip rubber feet. Ideal for produce, workshop parts, or bathroom storage.',
          cat_boxes, 69.00, 89.00, false, true, 'new', 29, true),

    -- Hooks & Rails
    (p8,  'Pegboard Tool Organiser Kit',
          'pegboard-tool-organiser-kit',
          'Complete pegboard system with 48-piece hook and holder set. Steel pegboard with a satin finish. Includes mounting hardware. Customisable layout for any tool collection.',
          cat_hooks, 89.00, 109.00, true, false, 'bestseller', 55, true),

    (p9,  'Magnetic Tool Rail 60cm',
          'magnetic-tool-rail-60cm',
          'Powerful neodymium magnetic strip holds tools securely. Stainless steel housing. Easy wall mounting. Holds up to 5kg of tools. Ideal for kitchen knives or workshop tools.',
          cat_hooks, 39.00, NULL, false, true, 'new', 72, true),

    (p10, 'Heavy-Duty S-Hook Set of 20',
          'heavy-duty-s-hook-set-of-20',
          'Zinc-plated steel S-hooks in three sizes. 50kg load capacity per hook. Smooth finish prevents scratching. Works with any rail or pegboard system.',
          cat_hooks, 24.00, 32.00, false, false, 'promo', 143, true),

    -- Workbench
    (p11, 'Solid Hardwood Workbench 180cm',
          'solid-hardwood-workbench-180cm',
          'Crafted from solid beech with a thick 70mm worktop. Integrated vice, two drawers, and lower shelf. Mortise and tenon joinery for lifetime durability. The centrepiece of any serious workshop.',
          cat_workbench, 649.00, 799.00, true, false, 'bestseller', 8, true),

    (p12, 'Folding Workbench with Vice',
          'folding-workbench-with-vice',
          'Space-saving folding workbench that mounts to any wall. Integrated clamping vice with 300mm jaw opening. Solid pine top. Folds flat to 15cm depth when not in use.',
          cat_workbench, 189.00, NULL, false, true, 'new', 21, true),

    -- Containers
    (p13, 'Airtight Glass Storage Jar Set of 5',
          'airtight-glass-storage-jar-set-of-5',
          'Borosilicate glass jars with stainless steel lids and silicone seals. Dishwasher safe. Five sizes from 250ml to 2L. Keeps dry goods fresh for months.',
          cat_containers, 55.00, 69.00, true, false, 'favourite', 67, true),

    (p14, 'Modular Drawer Organiser Set',
          'modular-drawer-organiser-set',
          'Interlocking bamboo dividers that fit any drawer. 24 pieces in 4 sizes. Smooth finish. Eco-certified bamboo. Transforms chaotic drawers into organised spaces.',
          cat_containers, 42.00, NULL, false, false, 'favourite', 89, true),

    (p15, 'Clear Stackable Pantry Containers Set of 8',
          'clear-stackable-pantry-containers-set-of-8',
          'BPA-free clear containers with airtight lids. Uniform square shape maximises shelf space. Includes 40 chalk labels and a marker. Dishwasher safe.',
          cat_containers, 68.00, 85.00, false, true, 'new', 44, true),

    -- Wall Storage
    (p16, 'Slatwall Panel Storage System',
          'slatwall-panel-storage-system',
          'Versatile slatwall panels with a full accessory kit. Includes 12 hooks, 4 shelves, and 2 baskets. Powder-coated steel. Covers 1.2m x 2.4m of wall space. Ideal for garage or utility room.',
          cat_wall_storage, 299.00, 349.00, true, false, 'bestseller', 14, true)

  ON CONFLICT (slug) DO NOTHING;

  -- ─── Product Images ────────────────────────────────────────────────────────
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order) VALUES
    -- p1: Pro Steel Shelving
    (p1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Five-tier steel shelving unit in a clean garage workshop', 0),
    (p1, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Close-up of steel shelf bracket and adjustable tier mechanism', 1),
    (p1, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 'Steel shelving unit loaded with organised storage boxes', 2),

    -- p2: Modular Cube Shelving
    (p2, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'Modular cube shelving unit in walnut finish against white wall', 0),
    (p2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Detail of cube shelf joint and walnut veneer surface', 1),

    -- p3: Floating Wall Shelves
    (p3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Three floating pine shelves on a white wall with plants and books', 0),
    (p3, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'Side view of floating shelf showing invisible bracket system', 1),

    -- p4: Heavy-Duty Garage Shelving
    (p4, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 'Heavy-duty four-tier zinc-plated shelving in a garage', 0),
    (p4, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Reinforced corner brace detail on heavy-duty shelving unit', 1),

    -- p5: Stackable Storage Boxes
    (p5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Set of six clear stackable storage boxes with clip lids', 0),
    (p5, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 'Storage boxes stacked showing interlocking mechanism', 1),

    -- p6: Canvas Storage Bin
    (p6, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 'Large canvas storage bin with leather handles in a living room', 0),
    (p6, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Canvas bin collapsed flat showing space-saving design', 1),

    -- p7: Wire Baskets
    (p7, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Set of three graduated wire baskets in powder-coated black', 0),
    (p7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Wire basket detail showing open weave and rubber feet', 1),

    -- p8: Pegboard Kit
    (p8, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 'Pegboard tool organiser with full set of hooks and holders mounted on workshop wall', 0),
    (p8, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Close-up of pegboard hooks holding various hand tools', 1),

    -- p9: Magnetic Tool Rail
    (p9, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Stainless steel magnetic tool rail mounted under kitchen cabinet holding knives', 0),

    -- p10: S-Hooks
    (p10, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Set of twenty zinc-plated S-hooks in three sizes on a white background', 0),

    -- p11: Hardwood Workbench
    (p11, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 'Solid beech hardwood workbench with integrated vice and two drawers in a workshop', 0),
    (p11, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Close-up of workbench vice and thick beech worktop surface', 1),
    (p11, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Workbench drawer detail showing dovetail joinery', 2),

    -- p12: Folding Workbench
    (p12, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', 'Wall-mounted folding workbench in open position with vice engaged', 0),
    (p12, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Folding workbench collapsed flat against wall showing 15cm depth', 1),

    -- p13: Glass Jars
    (p13, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 'Set of five borosilicate glass storage jars with stainless steel lids on a pantry shelf', 0),
    (p13, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Glass jar lid detail showing silicone seal and stainless steel clasp', 1),

    -- p14: Drawer Organiser
    (p14, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Bamboo drawer organiser set arranged in a kitchen drawer with utensils', 0),
    (p14, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 'Individual bamboo divider pieces showing interlocking mechanism', 1),

    -- p15: Pantry Containers
    (p15, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80', 'Eight clear stackable pantry containers with chalk labels on a white shelf', 0),
    (p15, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Container lid detail showing airtight seal mechanism', 1),

    -- p16: Slatwall System
    (p16, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Slatwall panel storage system covering full garage wall with hooks, shelves, and baskets', 0),
    (p16, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Slatwall accessory detail showing hook and shelf attachment mechanism', 1)

  ON CONFLICT DO NOTHING;

  -- ─── Product Variants ──────────────────────────────────────────────────────
  INSERT INTO public.product_variants (product_id, name, value, hex_color, price_delta, stock_qty, sku) VALUES
    -- p1: Steel Shelving - Colours
    (p1, 'Colour', 'Slate Grey',  '#2E3A45', 0,    20, 'PSS-5T-SG'),
    (p1, 'Colour', 'Chalk White', '#F5F3EF', 0,    15, 'PSS-5T-CW'),
    (p1, 'Colour', 'Ink Black',   '#1C1C1E', 10.00, 12, 'PSS-5T-IB'),

    -- p2: Cube Shelving - Finishes
    (p2, 'Finish', 'Walnut',      '#8B6914', 0,    10, 'MCS-WN'),
    (p2, 'Finish', 'White Oak',   '#D4B896', 0,    8,  'MCS-WO'),
    (p2, 'Finish', 'Matte Black', '#1C1C1E', 20.00, 5, 'MCS-MB'),

    -- p5: Storage Boxes - Colours
    (p5, 'Colour', 'Clear',       '#E8E8E8', 0,    40, 'SSB-6-CL'),
    (p5, 'Colour', 'Slate Grey',  '#2E3A45', 0,    30, 'SSB-6-SG'),
    (p5, 'Colour', 'Sage Green',  '#7A9E7E', 0,    24, 'SSB-6-SG2'),

    -- p6: Canvas Bin - Colours
    (p6, 'Colour', 'Natural',     '#D4B896', 0,    15, 'CSB-L-NA'),
    (p6, 'Colour', 'Slate',       '#2E3A45', 0,    13, 'CSB-L-SL'),
    (p6, 'Colour', 'Terracotta',  '#C4714A', 0,    10, 'CSB-L-TC'),

    -- p8: Pegboard - Sizes
    (p8, 'Size', '60 x 60cm',  NULL, 0,     25, 'PBK-60'),
    (p8, 'Size', '90 x 60cm',  NULL, 20.00, 20, 'PBK-90'),
    (p8, 'Size', '120 x 60cm', NULL, 40.00, 10, 'PBK-120'),

    -- p11: Workbench - Sizes
    (p11, 'Size', '150cm', NULL, -100.00, 4, 'SHW-150'),
    (p11, 'Size', '180cm', NULL, 0,       3, 'SHW-180'),
    (p11, 'Size', '210cm', NULL, 100.00,  1, 'SHW-210'),

    -- p16: Slatwall - Colours
    (p16, 'Colour', 'Slate Grey',  '#2E3A45', 0,    8, 'SWP-SG'),
    (p16, 'Colour', 'Chalk White', '#F5F3EF', 0,    4, 'SWP-CW'),
    (p16, 'Colour', 'Ink Black',   '#1C1C1E', 30.00, 2, 'SWP-IB')

  ON CONFLICT (sku) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
