# Complex SQL Queries — Campus Lost & Found System

These analytical queries demonstrate advanced SQL concepts used in this project.  
All queries work on the PostgreSQL schema created by SQLAlchemy.

---

## Query 1: Most Common Lost Item Categories

**Business use:** Which category has the most lost items? Useful for campus announcements.

```sql
SELECT
    c.name AS category,
    COUNT(li.id) AS total_lost,
    ROUND(
        COUNT(li.id) * 100.0 /
        (SELECT COUNT(*) FROM lost_items),
        1
    ) AS percentage
FROM categories c
LEFT JOIN lost_items li
ON li.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_lost DESC;
```

**Concepts used:** `LEFT JOIN`, `COUNT`, `GROUP BY`, `ORDER BY`, scalar subquery for percentage.

---

## Query 2: Items Found by Location (Hotspot Analysis)

**Business use:** Which campus locations have the most found items? Helps place awareness boards.

```sql
SELECT
    COALESCE(location, 'Unknown') AS location,
    COUNT(*) AS items_found,
    STRING_AGG(title, ', ') AS item_titles
FROM found_items
GROUP BY location
ORDER BY items_found DESC
LIMIT 10;
```

**Concepts used:** `COALESCE`, `STRING_AGG`, `GROUP BY`, `ORDER BY`, `LIMIT`.

---

## Query 3: Pending Claims with Full Details

**Business use:** Admin dashboard query to display unresolved claims along with claimant and item details.

```sql
SELECT
    cl.id AS claim_id,
    fi.title AS found_item,
    fi.location AS found_at,
    u.name AS claimant_name,
    u.email AS claimant_email,
    cl.description AS proof,
    cl.created_at AS submitted_on
FROM claims cl
JOIN found_items fi
ON fi.id = cl.found_item_id
JOIN users u
ON u.id = cl.claimant_id
WHERE cl.status = 'PENDING'
ORDER BY cl.created_at ASC;
```

**Concepts used:** Multi-table `JOIN`, filtering using `WHERE`, chronological sorting.

---

## Query 4: Users with Most Activity (Reports + Claims)

**Business use:** Helps identify the most active users on the platform for recognition or analytics.

```sql
SELECT
    u.name,
    u.email,
    COUNT(DISTINCT li.id) AS lost_reports,
    COUNT(DISTINCT fi.id) AS found_reports,
    COUNT(DISTINCT cl.id) AS claims_submitted,
    (
        COUNT(DISTINCT li.id) +
        COUNT(DISTINCT fi.id) +
        COUNT(DISTINCT cl.id)
    ) AS total_activity
FROM users u
LEFT JOIN lost_items li
ON li.user_id = u.id
LEFT JOIN found_items fi
ON fi.user_id = u.id
LEFT JOIN claims cl
ON cl.claimant_id = u.id
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.name, u.email
ORDER BY total_activity DESC;
```

**Concepts used:** Multiple `LEFT JOIN`, `COUNT(DISTINCT ...)`, computed columns, aggregation.

---

## Query 5: Successfully Reunited Items (Full Journey)

**Business use:** Displays items that were successfully claimed and returned to owners.

```sql
SELECT
    fi.title AS item_title,
    fi.location AS found_at,
    fi.date_found,
    reporter.name AS reported_by,
    claimant.name AS claimed_by,
    cl.created_at AS claim_submitted,
    cl.updated_at AS claim_resolved,
    EXTRACT(
        DAY FROM cl.updated_at - cl.created_at
    ) AS days_to_resolve
FROM found_items fi
JOIN claims cl
ON cl.found_item_id = fi.id
AND cl.status = 'APPROVED'
JOIN users reporter
ON reporter.id = fi.user_id
JOIN users claimant
ON claimant.id = cl.claimant_id
WHERE fi.status = 'CLAIMED'
ORDER BY cl.updated_at DESC;
```

**Concepts used:** Multiple joins with aliases, date arithmetic, `EXTRACT`, compound filtering.

---

## Query 6: Unread Notification Count Per User

**Business use:** Used for notification badge count in the user dashboard.

```sql
SELECT
    u.name,
    u.email,
    COUNT(n.id)
    FILTER (
        WHERE n.is_read = false
    ) AS unread_count,
    COUNT(n.id) AS total_notifications
FROM users u
LEFT JOIN notifications n
ON n.user_id = u.id
GROUP BY u.id, u.name, u.email
HAVING COUNT(n.id)
FILTER (
    WHERE n.is_read = false
) > 0
ORDER BY unread_count DESC;
```

**Concepts used:** `FILTER (WHERE ...)`, `LEFT JOIN`, aggregation, `HAVING`.

---

## Query 7: Recently Reported Lost Items

**Business use:** Displays the latest lost items reported by students.

```sql
SELECT
    title,
    category_id,
    location,
    created_at
FROM lost_items
ORDER BY created_at DESC
LIMIT 5;
```

**Concepts used:** `ORDER BY`, `LIMIT`, timestamp sorting.

---

## Query 8: Most Active Lost Item Locations

**Business use:** Identifies campus locations where items are most frequently lost.

```sql
SELECT
    location,
    COUNT(*) AS total_lost_items
FROM lost_items
GROUP BY location
ORDER BY total_lost_items DESC;
```

**Concepts used:** Aggregation, grouping, statistical analysis.

---

## Query 9: Approved vs Rejected Claims Statistics

**Business use:** Helps administrators analyze claim approval trends.

```sql
SELECT
    status,
    COUNT(*) AS total_claims
FROM claims
GROUP BY status
ORDER BY total_claims DESC;
```

**Concepts used:** `GROUP BY`, aggregate functions, reporting queries.

---

## Query 10: Users Who Never Submitted Claims

**Business use:** Identifies users who have not interacted with the claim system.

```sql
SELECT
    u.name,
    u.email
FROM users u
WHERE u.id NOT IN (
    SELECT claimant_id
    FROM claims
);
```

**Concepts used:** Subquery, `NOT IN`, filtering.

---

## Query 11: Average Claims Per Found Item

**Business use:** Measures average claim attempts made per found item.

```sql
SELECT
    AVG(claim_count) AS average_claims
FROM (
    SELECT
        found_item_id,
        COUNT(*) AS claim_count
    FROM claims
    GROUP BY found_item_id
) AS claim_data;
```

**Concepts used:** Nested subquery, `AVG`, aggregation.

---

## Query 12: Found Items That Are Still Unclaimed

**Business use:** Displays found items that are yet to be claimed by owners.

```sql
SELECT
    title,
    location,
    date_found
FROM found_items
WHERE status = 'AVAILABLE'
ORDER BY date_found DESC;
```

**Concepts used:** Filtering using `WHERE`, sorting results.

---

## Query 13: Category-wise Found Item Distribution

**Business use:** Shows which item categories are recovered most frequently.

```sql
SELECT
    c.name AS category,
    COUNT(fi.id) AS total_found
FROM categories c
LEFT JOIN found_items fi
ON fi.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_found DESC;
```

**Concepts used:** `LEFT JOIN`, aggregation, category analysis.

---

## Query 14: Claim Resolution Time Analysis

**Business use:** Calculates average time taken to resolve claims.

```sql
SELECT
    ROUND(
        AVG(
            EXTRACT(
                DAY FROM updated_at - created_at
            )
        ),
        2
    ) AS avg_resolution_days
FROM claims
WHERE status = 'APPROVED';
```

**Concepts used:** Date arithmetic, `AVG`, `EXTRACT`, filtering.

---

## Query 15: Total Lost vs Found Item Comparison

**Business use:** Compares overall lost item reports against found item reports.

```sql
SELECT
    (SELECT COUNT(*) FROM lost_items) AS total_lost,
    (SELECT COUNT(*) FROM found_items) AS total_found;
```

**Concepts used:** Scalar subqueries, comparative statistics.