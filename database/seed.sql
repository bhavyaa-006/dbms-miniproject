-- =============================================================================
-- Campus Lost & Found Management System — Raw SQL Reference Data
-- =============================================================================
-- Run AFTER tables are created.
-- This file is for reference / manual seeding via psql.
-- =============================================================================

-- Clear reference data (respects FK order)
TRUNCATE categories
    RESTART IDENTITY CASCADE;

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, description) VALUES
  ('cat-1', 'Electronics',  'Phones, laptops, chargers, earphones'),
  ('cat-2', 'Documents',    'ID cards, admit cards, notebooks'),
  ('cat-3', 'Clothing',     'Jackets, scarves, caps, bags'),
  ('cat-4', 'Accessories',  'Watches, keys, wallets, spectacles'),
  ('cat-5', 'Sports',       'Bats, balls, rackets, equipment'),
  ('cat-6', 'Other',        'Anything that does not fit above');
