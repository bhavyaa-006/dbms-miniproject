# SQL Queries — Campus Lost & Found System

This section contains the SQL queries used in the Campus Lost & Found Management System.  
The queries demonstrate CRUD operations, joins, aggregate functions, indexing, triggers, procedures, and analytical operations implemented in PostgreSQL.

---

# Database Creation

## Query 1: Create Database

**Purpose:** Creates the database used for the project.

```sql
CREATE DATABASE campus_lost_found;
```

**Concepts used:** Database creation.

---

# Table Creation Queries

## Query 2: Create Users Table

**Purpose:** Stores user account information for students and administrators.

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Concepts used:** `PRIMARY KEY`, `UNIQUE`, constraints, default values.

---

## Query 3: Create Lost Items Table

**Purpose:** Stores information about lost items reported by users.

```sql
CREATE TABLE lost_items (
    lost_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id)
    ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    location_lost VARCHAR(100),
    date_lost DATE,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Concepts used:** Foreign keys, cascading delete, constraints.

---

## Query 4: Create Found Items Table

**Purpose:** Stores details of found items submitted by users.

```sql
CREATE TABLE found_items (
    found_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id)
    ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    location_found VARCHAR(100),
    date_found DATE,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'unclaimed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Concepts used:** Relational schema design, foreign keys.

---

## Query 5: Create Claims Table

**Purpose:** Stores ownership claim requests for found items.

```sql
CREATE TABLE claims (
    claim_id SERIAL PRIMARY KEY,
    found_id INT REFERENCES found_items(found_id)
    ON DELETE CASCADE,
    claimant_id INT REFERENCES users(user_id)
    ON DELETE CASCADE,
    proof_description TEXT,
    claim_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Concepts used:** Foreign key relationships, normalization.

---

## Query 6: Create Notifications Table

**Purpose:** Stores notifications sent to users.

```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id)
    ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Concepts used:** Boolean fields, default values, relational mapping.

---

# Insert Queries

## Query 7: Insert User

**Purpose:** Adds a new user into the system.

```sql
INSERT INTO users (
    full_name,
    email,
    password_hash,
    role
)
VALUES (
    'Rahul Sharma',
    'rahul@gmail.com',
    'hashed_password',
    'student'
);
```

**Concepts used:** `INSERT INTO`, data insertion.

---

## Query 8: Insert Lost Item

**Purpose:** Adds a newly reported lost item.

```sql
INSERT INTO lost_items (
    user_id,
    item_name,
    category,
    description,
    location_lost,
    date_lost,
    image_url
)
VALUES (
    1,
    'Black Wallet',
    'Accessories',
    'Leather wallet with ID card',
    'Library Block',
    '2026-05-10',
    'wallet.jpg'
);
```

**Concepts used:** Insert operation with multiple columns.

---

## Query 9: Insert Found Item

**Purpose:** Stores details of a found item.

```sql
INSERT INTO found_items (
    user_id,
    item_name,
    category,
    description,
    location_found,
    date_found,
    image_url
)
VALUES (
    2,
    'Blue Water Bottle',
    'Bottle',
    'Steel bottle with stickers',
    'Cafeteria',
    '2026-05-11',
    'bottle.jpg'
);
```

**Concepts used:** Data insertion, record management.

---

## Query 10: Insert Claim

**Purpose:** Adds a claim request for a found item.

```sql
INSERT INTO claims (
    found_id,
    claimant_id,
    proof_description
)
VALUES (
    1,
    1,
    'Bottle has Avengers sticker and scratch near cap'
);
```

**Concepts used:** Foreign key insertion.

---

# Update Queries

## Query 11: Update Lost Item Status

**Purpose:** Marks a lost item as resolved.

```sql
UPDATE lost_items
SET status = 'resolved'
WHERE lost_id = 1;
```

**Concepts used:** `UPDATE`, conditional modification.

---

## Query 12: Update Found Item Status

**Purpose:** Marks a found item as claimed.

```sql
UPDATE found_items
SET status = 'claimed'
WHERE found_id = 1;
```

**Concepts used:** Conditional updates.

---

## Query 13: Approve Claim

**Purpose:** Updates claim verification status.

```sql
UPDATE claims
SET claim_status = 'approved'
WHERE claim_id = 1;
```

**Concepts used:** Record updates using conditions.

---

## Query 14: Mark Notification as Read

**Purpose:** Marks user notifications as read.

```sql
UPDATE notifications
SET is_read = TRUE
WHERE notification_id = 1;
```

**Concepts used:** Boolean updates.

---

# Delete Queries

## Query 15: Delete Lost Item

**Purpose:** Removes a lost item report from the database.

```sql
DELETE FROM lost_items
WHERE lost_id = 1;
```

**Concepts used:** `DELETE`, conditional deletion.

---

## Query 16: Delete Found Item

**Purpose:** Removes a found item report.

```sql
DELETE FROM found_items
WHERE found_id = 1;
```

**Concepts used:** Row deletion.

---

## Query 17: Delete Claim

**Purpose:** Deletes a submitted ownership claim.

```sql
DELETE FROM claims
WHERE claim_id = 1;
```

**Concepts used:** Record deletion.

---

# Basic Select Queries

## Query 18: View All Lost Items

**Purpose:** Displays all lost item records.

```sql
SELECT *
FROM lost_items;
```

**Concepts used:** Basic retrieval query.

---

## Query 19: View All Found Items

**Purpose:** Displays all found item records.

```sql
SELECT *
FROM found_items;
```

**Concepts used:** `SELECT *`.

---

## Query 20: View Open Lost Items

**Purpose:** Retrieves only unresolved lost item reports.

```sql
SELECT *
FROM lost_items
WHERE status = 'open';
```

**Concepts used:** Filtering using `WHERE`.

---

## Query 21: View Unclaimed Found Items

**Purpose:** Displays all unclaimed found items.

```sql
SELECT *
FROM found_items
WHERE status = 'unclaimed';
```

**Concepts used:** Conditional filtering.

---

# Join Queries

## Query 22: Lost Items with User Details

**Purpose:** Displays lost item reports along with user information.

```sql
SELECT
    l.lost_id,
    l.item_name,
    l.category,
    u.full_name,
    u.email
FROM lost_items l
JOIN users u
ON l.user_id = u.user_id;
```

**Concepts used:** `INNER JOIN`, relational queries.

---

## Query 23: Found Items with Finder Details

**Purpose:** Displays found items along with finder details.

```sql
SELECT
    f.found_id,
    f.item_name,
    f.location_found,
    u.full_name
FROM found_items f
JOIN users u
ON f.user_id = u.user_id;
```

**Concepts used:** Join operations.

---

## Query 24: Claims with Claimant Details

**Purpose:** Displays claim records with claimant information.

```sql
SELECT
    c.claim_id,
    f.item_name,
    u.full_name,
    c.claim_status
FROM claims c
JOIN found_items f
ON c.found_id = f.found_id
JOIN users u
ON c.claimant_id = u.user_id;
```

**Concepts used:** Multiple table joins.

---

# Aggregate Queries

## Query 25: Total Number of Lost Items

**Purpose:** Counts total lost item reports.

```sql
SELECT COUNT(*) AS total_lost_items
FROM lost_items;
```

**Concepts used:** Aggregate function `COUNT`.

---

## Query 26: Total Number of Found Items

**Purpose:** Counts total found item reports.

```sql
SELECT COUNT(*) AS total_found_items
FROM found_items;
```

**Concepts used:** Aggregation.

---

## Query 27: Most Common Lost Item Category

**Purpose:** Identifies the category with the highest number of lost items.

```sql
SELECT
    category,
    COUNT(*) AS total
FROM lost_items
GROUP BY category
ORDER BY total DESC;
```

**Concepts used:** `GROUP BY`, aggregation, sorting.

---

## Query 28: Total Pending Claims

**Purpose:** Counts all pending ownership claims.

```sql
SELECT COUNT(*) AS pending_claims
FROM claims
WHERE claim_status = 'pending';
```

**Concepts used:** Conditional aggregation.

---

# Subqueries

## Query 29: Users Reporting Multiple Lost Items

**Purpose:** Displays users who reported more than one lost item.

```sql
SELECT full_name
FROM users
WHERE user_id IN (
    SELECT user_id
    FROM lost_items
    GROUP BY user_id
    HAVING COUNT(*) > 1
);
```

**Concepts used:** Subqueries, `HAVING`.

---

## Query 30: Found Items Having Claims

**Purpose:** Displays found items that already have claim requests.

```sql
SELECT item_name
FROM found_items
WHERE found_id IN (
    SELECT found_id
    FROM claims
);
```

**Concepts used:** Nested queries.

---

# Views

## Query 31: Create Active Lost Items View

**Purpose:** Creates a reusable virtual table for open lost items.

```sql
CREATE VIEW active_lost_items AS
SELECT
    item_name,
    category,
    location_lost
FROM lost_items
WHERE status = 'open';
```

**Concepts used:** SQL views.

---

## Query 32: Create Approved Claims View

**Purpose:** Stores approved claim data as a view.

```sql
CREATE VIEW approved_claims AS
SELECT *
FROM claims
WHERE claim_status = 'approved';
```

**Concepts used:** Virtual tables.

---

# Indexing Queries

## Query 33: Create Index on Item Name

**Purpose:** Improves item search performance.

```sql
CREATE INDEX idx_item_name
ON lost_items(item_name);
```

**Concepts used:** Indexing, optimization.

---

## Query 34: Create Index on Category

**Purpose:** Speeds up category-based searches.

```sql
CREATE INDEX idx_category
ON found_items(category);
```

**Concepts used:** Database optimization.

---

# Trigger Queries

## Query 35: Create Trigger Function

**Purpose:** Automatically updates found item status when a claim is approved.

```sql
CREATE OR REPLACE FUNCTION update_found_item_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claim_status = 'approved' THEN
        UPDATE found_items
        SET status = 'claimed'
        WHERE found_id = NEW.found_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Concepts used:** Trigger functions, automation.

---

## Query 36: Create Trigger

**Purpose:** Executes trigger function after claim updates.

```sql
CREATE TRIGGER trigger_update_found_item
AFTER UPDATE ON claims
FOR EACH ROW
EXECUTE FUNCTION update_found_item_status();
```

**Concepts used:** Database triggers.

---

# Stored Procedure

## Query 37: Procedure to Add Notification

**Purpose:** Inserts notifications into the system.

```sql
CREATE OR REPLACE PROCEDURE add_notification(
    p_user_id INT,
    p_message TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO notifications(user_id, message)
    VALUES (p_user_id, p_message);
END;
$$;
```

**Concepts used:** Stored procedures.

---

# Transaction Queries

## Query 38: Claim Approval Transaction

**Purpose:** Ensures claim approval and item update happen together safely.

```sql
BEGIN;

UPDATE claims
SET claim_status = 'approved'
WHERE claim_id = 1;

UPDATE found_items
SET status = 'claimed'
WHERE found_id = 1;

COMMIT;
```

**Concepts used:** Transactions, atomicity.

---

# Backup Query

## Query 39: PostgreSQL Backup Command

**Purpose:** Creates a backup of the project database.

```sql
pg_dump -U postgres campus_lost_found > backup.sql
```

**Concepts used:** Database backup and recovery.