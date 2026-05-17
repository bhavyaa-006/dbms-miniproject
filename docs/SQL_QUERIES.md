# Complex SQL Queries — Campus Lost & Found System

These analytical queries demonstrate advanced SQL concepts used in this project.
All queries work on the PostgreSQL schema created by SQLAlchemy.

---

## Query 1: Most Common Lost Item Categories

**Business use:** Which category has the most lost items? Useful for campus announcements.

```sql
SELECT
    c.name                          AS category,
    COUNT(li.id)                    AS total_lost,
    ROUND(COUNT(li.id) * 100.0 /
        (SELECT COUNT(*) FROM lost_items), 1) AS percentage
FROM categories c
LEFT JOIN lost_items li ON li.category_id = c.id
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
    COUNT(*)                       AS items_found,
    STRING_AGG(title, ', ')        AS item_titles
FROM found_items
GROUP BY location
ORDER BY items_found DESC
LIMIT 10;
```

**Concepts used:** `COALESCE`, `STRING_AGG`, `GROUP BY`, `ORDER BY`, `LIMIT`.

---

## Query 3: Pending Claims with Full Details

**Business use:** Admin dashboard — see all unresolved claims with item and claimant info.

```sql
SELECT
    cl.id                           AS claim_id,
    fi.title                        AS found_item,
    fi.location                     AS found_at,
    u.name                          AS claimant_name,
    u.email                         AS claimant_email,
    cl.description                  AS proof,
    cl.created_at                   AS submitted_on
FROM claims cl
JOIN found_items fi ON fi.id = cl.found_item_id
JOIN users u        ON u.id  = cl.claimant_id
WHERE cl.status = 'PENDING'
ORDER BY cl.created_at ASC;  -- Oldest first (FIFO)
```

**Concepts used:** Multi-table `JOIN`, `WHERE` filter, `ORDER BY`.

---

## Query 4: Users with Most Activity (Reports + Claims)

**Business use:** Identify the most active users for leaderboard or recognition.

```sql
SELECT
    u.name,
    u.email,
    COUNT(DISTINCT li.id) AS lost_reports,
    COUNT(DISTINCT fi.id) AS found_reports,
    COUNT(DISTINCT cl.id) AS claims_submitted,
    (COUNT(DISTINCT li.id) + COUNT(DISTINCT fi.id) + COUNT(DISTINCT cl.id)) AS total_activity
FROM users u
LEFT JOIN lost_items  li ON li.user_id      = u.id
LEFT JOIN found_items fi ON fi.user_id      = u.id
LEFT JOIN claims      cl ON cl.claimant_id  = u.id
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.name, u.email
ORDER BY total_activity DESC;
```

**Concepts used:** Multiple `LEFT JOIN`, `COUNT(DISTINCT ...)`, computed column, `WHERE`, `GROUP BY`.

---

## Query 5: Successfully Reunited Items (Full Journey)

**Business use:** Show items that went from AVAILABLE → CLAIMED, with the full claim chain.

```sql
SELECT
    fi.title                                    AS item_title,
    fi.location                                 AS found_at,
    fi.date_found,
    reporter.name                               AS reported_by,
    claimant.name                               AS claimed_by,
    cl.created_at                               AS claim_submitted,
    cl.updated_at                               AS claim_resolved,
    EXTRACT(DAY FROM cl.updated_at - cl.created_at) AS days_to_resolve
FROM found_items fi
JOIN claims cl        ON cl.found_item_id = fi.id AND cl.status = 'APPROVED'
JOIN users reporter   ON reporter.id = fi.user_id
JOIN users claimant   ON claimant.id = cl.claimant_id
WHERE fi.status = 'CLAIMED'
ORDER BY cl.updated_at DESC;
```

**Concepts used:** Multiple `JOIN` on same table with aliases, `EXTRACT`, date arithmetic, compound `WHERE`.

---

## Query 6: Unread Notification Count Per User

**Business use:** Used by the topbar to show unread notification badge count.

```sql
SELECT
    u.name,
    u.email,
    COUNT(n.id) FILTER (WHERE n.is_read = false) AS unread_count,
    COUNT(n.id)                                   AS total_notifications
FROM users u
LEFT JOIN notifications n ON n.user_id = u.id
GROUP BY u.id, u.name, u.email
HAVING COUNT(n.id) FILTER (WHERE n.is_read = false) > 0
ORDER BY unread_count DESC;
```

**Concepts used:** `FILTER (WHERE ...)` aggregate, `LEFT JOIN`, `GROUP BY`, `HAVING`.
