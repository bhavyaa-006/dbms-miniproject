-- =============================================================================
-- Campus Lost & Found Management System — Raw SQL Seed Data
-- =============================================================================
-- Run AFTER tables are created (python -m app.seed  OR  uvicorn startup).
-- This file is for reference / manual seeding via psql.
-- =============================================================================

-- Clear existing data (respects FK order)
TRUNCATE notifications, categories
    RESTART IDENTITY CASCADE;

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, description) VALUES
  ('cat-1', 'Electronics',  'Phones, laptops, chargers, earphones'),
  ('cat-2', 'Documents',    'ID cards, admit cards, notebooks'),
  ('cat-3', 'Clothing',     'Jackets, scarves, caps, bags'),
  ('cat-4', 'Accessories',  'Watches, keys, wallets, spectacles'),
  ('cat-5', 'Sports',       'Bats, balls, rackets, equipment'),
  ('cat-6', 'Other',        'Anything that does not fit above');
-- ── Notifications ─────────────────────────────────────────────────────────────
INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES
  ('notif-1', 'usr-alice',
   '✅ Your claim for ''Student ID Card'' has been APPROVED! Please collect your item.',
   false, NOW()),
  ('notif-2', 'usr-alice',
   '📢 A found item matching your lost iPhone has been posted. Check Found Items!',
   true, NOW());
