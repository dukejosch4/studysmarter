-- StudySmarter Migration: Products & Orders (Admin-Catalog Model)
-- Created: 2026-02-12
-- Description: Adds products and orders tables for admin-managed catalog with PayPal purchase flow

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'expired'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Products: Admin-created items linked to completed analyses
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_eur NUMERIC(10,2) NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Admin-created products linked to completed analyses';
COMMENT ON COLUMN products.analysis_id IS 'Reference to the analysis containing all generated content';
COMMENT ON COLUMN products.is_published IS 'Whether the product is visible in the public catalog';

-- Orders: Customer purchases with download token delivery
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  download_token UUID,
  download_token_expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Customer orders with manual PayPal confirmation flow';
COMMENT ON COLUMN orders.download_token IS 'UUID token for secure download link';
COMMENT ON COLUMN orders.download_token_expires_at IS 'Token expiration (72h after confirmation)';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_products_analysis_id ON products(analysis_id);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_download_token ON orders(download_token);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: publicly readable when published (for catalog)
CREATE POLICY "Published products are publicly readable"
  ON products FOR SELECT
  USING (is_published = true);

-- Orders: only accessible via service_role (admin API routes use admin client)
-- No public policies = no public access
