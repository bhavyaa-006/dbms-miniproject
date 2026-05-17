# Database Normalization — Campus Lost & Found System

## Overview

Our database schema follows the principles of normalization up to **Third Normal Form (3NF)**.
Normalization eliminates redundancy, prevents update anomalies, and ensures data integrity.

---

## First Normal Form (1NF)

> **Rule:** Each column must hold atomic (indivisible) values. No repeating groups.

### ✅ How our schema satisfies 1NF:

- Every column holds a single atomic value. For example, `users.email` stores one email, not a comma-separated list.
- There are no arrays or repeating groups in any table.
- Each table has a primary key (`id`).

### ❌ What would violate 1NF (example):

If we stored `categories` as a comma-separated value in `lost_items`:
```
lost_items.categories = "Electronics, Gadgets, Phone"  -- VIOLATION
```
Instead, we have a separate `categories` table with a foreign key reference.

---

## Second Normal Form (2NF)

> **Rule:** Must be in 1NF. Every non-key attribute must depend on the **entire** primary key (no partial dependencies).  
> *Partial dependency only applies to composite primary keys.*

### ✅ How our schema satisfies 2NF:

All our tables use a **single-column UUID primary key**, so partial dependencies cannot exist by definition.

Each attribute in every table depends on the full primary key:

| Table | Attribute | Depends on |
|---|---|---|
| `lost_items` | `title`, `location`, `status` | `lost_items.id` (full PK) |
| `claims` | `status`, `description` | `claims.id` (full PK) |
| `notifications` | `message`, `is_read` | `notifications.id` (full PK) |

### ❌ What would violate 2NF (example):

If we had a composite PK `(user_id, item_id)` in `lost_items` and stored `user_name` there:
```
-- user_name depends only on user_id, not on (user_id + item_id) — PARTIAL DEPENDENCY
(user_id, item_id) | user_name | title | location
```
We avoid this by keeping `user_name` in the `users` table and referencing via FK.

---

## Third Normal Form (3NF)

> **Rule:** Must be in 2NF. No **transitive dependencies** — non-key attributes must not depend on other non-key attributes.

### ✅ How our schema satisfies 3NF:

We extracted `category` into its own table. Consider what would happen without it:

```
-- Without 3NF (denormalized):
lost_items: id | title | category_name | category_description | ...
```
Here `category_description` depends on `category_name`, not on `id` — **transitive dependency**.

By creating a `categories` table:
```
categories: id | name | description
lost_items: id | title | category_id (FK) | ...
```
Now `category_description` lives in `categories` and depends only on `categories.id`.

### ✅ Other 3NF examples in our schema:

| Removed transitive dependency | Solution |
|---|---|
| `user_name` in `claims` | `claims.claimant_id → users.name` via JOIN |
| `category_name` in `lost_items` | `lost_items.category_id → categories.name` via JOIN |
| `found_item_title` in `notifications` | Stored in message string; `found_items` joined when needed |

---

## Summary Table

| Normal Form | Requirement | Status |
|---|---|---|
| **1NF** | Atomic values, no repeating groups | ✅ |
| **2NF** | No partial dependencies on PK | ✅ |
| **3NF** | No transitive dependencies | ✅ |

Our schema is fully normalized to **3NF**, which is the standard requirement for most production relational databases.
