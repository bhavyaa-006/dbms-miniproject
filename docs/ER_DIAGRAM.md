# Entity Relationship Diagram (ER Diagram) — Campus Lost & Found System

This document explains the Entity Relationship (ER) Diagram used in the Campus Lost & Found Management System.  
The ER diagram represents the database structure, entities, attributes, and relationships between tables used in the project.

---

# Introduction

An Entity Relationship Diagram (ER Diagram) is a visual representation of database entities and their relationships.  
It helps in understanding:

- Database structure
- Table relationships
- Primary and foreign keys
- Data flow between entities

The ER diagram for this project was designed to ensure:

- Proper normalization
- Minimal redundancy
- Efficient relational mapping
- Strong data integrity

---

# Main Entities in the System

The database consists of the following entities:

1. Users
2. Lost Items
3. Found Items
4. Claims
5. Notifications
6. Categories

---

# Entity 1: Users

## Description

Stores information about students and administrators using the system.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| user_id | SERIAL | Primary Key |
| full_name | VARCHAR(100) | Name of the user |
| email | VARCHAR(100) | Unique email address |
| password_hash | TEXT | Encrypted password |
| role | VARCHAR(20) | Student/Admin role |
| created_at | TIMESTAMP | Account creation time |

---

## Primary Key

```text
user_id
```

---

# Entity 2: Lost Items

## Description

Stores details of items reported as lost by users.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| lost_id | SERIAL | Primary Key |
| user_id | INT | Foreign Key referencing users |
| category_id | INT | Foreign Key referencing categories |
| item_name | VARCHAR(100) | Name of lost item |
| description | TEXT | Item description |
| location_lost | VARCHAR(100) | Location where item was lost |
| date_lost | DATE | Date of loss |
| image_url | TEXT | Uploaded image path |
| status | VARCHAR(20) | Open/Resolved |
| created_at | TIMESTAMP | Report creation time |

---

## Primary Key

```text
lost_id
```

---

## Foreign Keys

```text
user_id → users.user_id
category_id → categories.category_id
```

---

# Entity 3: Found Items

## Description

Stores details of items found on campus.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| found_id | SERIAL | Primary Key |
| user_id | INT | Foreign Key referencing users |
| category_id | INT | Foreign Key referencing categories |
| item_name | VARCHAR(100) | Name of found item |
| description | TEXT | Item description |
| location_found | VARCHAR(100) | Found location |
| date_found | DATE | Date item was found |
| image_url | TEXT | Uploaded image |
| status | VARCHAR(20) | Available/Claimed |
| created_at | TIMESTAMP | Report creation time |

---

## Primary Key

```text
found_id
```

---

## Foreign Keys

```text
user_id → users.user_id
category_id → categories.category_id
```

---

# Entity 4: Claims

## Description

Stores ownership claim requests submitted by users.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| claim_id | SERIAL | Primary Key |
| found_id | INT | Foreign Key referencing found items |
| claimant_id | INT | Foreign Key referencing users |
| proof_description | TEXT | Ownership proof |
| claim_status | VARCHAR(20) | Pending/Approved/Rejected |
| created_at | TIMESTAMP | Claim creation time |

---

## Primary Key

```text
claim_id
```

---

## Foreign Keys

```text
found_id → found_items.found_id
claimant_id → users.user_id
```

---

# Entity 5: Notifications

## Description

Stores notifications sent to users regarding claims and item updates.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| notification_id | SERIAL | Primary Key |
| user_id | INT | Foreign Key referencing users |
| message | TEXT | Notification content |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Notification timestamp |

---

## Primary Key

```text
notification_id
```

---

## Foreign Key

```text
user_id → users.user_id
```

---

# Entity 6: Categories

## Description

Stores predefined item categories.

---

## Attributes

| Attribute Name | Data Type | Description |
|----------------|-----------|-------------|
| category_id | SERIAL | Primary Key |
| category_name | VARCHAR(50) | Category name |

---

## Primary Key

```text
category_id
```

---

# Relationships Between Entities

# 1. Users → Lost Items

## Relationship Type

```text
One-to-Many
```

## Description

One user can report multiple lost items.

---

# 2. Users → Found Items

## Relationship Type

```text
One-to-Many
```

## Description

One user can report multiple found items.

---

# 3. Users → Claims

## Relationship Type

```text
One-to-Many
```

## Description

One user can submit multiple ownership claims.

---

# 4. Found Items → Claims

## Relationship Type

```text
One-to-Many
```

## Description

One found item can receive multiple claims.

---

# 5. Categories → Lost Items

## Relationship Type

```text
One-to-Many
```

## Description

One category can contain multiple lost items.

---

# 6. Categories → Found Items

## Relationship Type

```text
One-to-Many
```

## Description

One category can contain multiple found items.

---

# 7. Users → Notifications

## Relationship Type

```text
One-to-Many
```

## Description

One user can receive multiple notifications.

---

# ER Diagram Representation

```text
+------------------+
|      USERS       |
+------------------+
| user_id (PK)     |
| full_name        |
| email            |
| password_hash    |
| role             |
+------------------+
        |
        | 1
        |
        | M
+------------------+
|    LOST_ITEMS    |
+------------------+
| lost_id (PK)     |
| user_id (FK)     |
| category_id (FK) |
| item_name        |
| description      |
| location_lost    |
| status           |
+------------------+

        |
        | 1
        |
        | M
+------------------+
|   FOUND_ITEMS    |
+------------------+
| found_id (PK)    |
| user_id (FK)     |
| category_id (FK) |
| item_name        |
| description      |
| location_found   |
| status           |
+------------------+

        |
        | 1
        |
        | M
+------------------+
|      CLAIMS      |
+------------------+
| claim_id (PK)    |
| found_id (FK)    |
| claimant_id (FK) |
| claim_status     |
+------------------+

+------------------+
|   CATEGORIES     |
+------------------+
| category_id (PK) |
| category_name    |
+------------------+

+----------------------+
|    NOTIFICATIONS     |
+----------------------+
| notification_id (PK) |
| user_id (FK)         |
| message              |
| is_read              |
+----------------------+
```

---

# Cardinality Summary

| Relationship | Cardinality |
|--------------|-------------|
| Users → Lost Items | One-to-Many |
| Users → Found Items | One-to-Many |
| Users → Claims | One-to-Many |
| Found Items → Claims | One-to-Many |
| Categories → Lost Items | One-to-Many |
| Categories → Found Items | One-to-Many |
| Users → Notifications | One-to-Many |

---

# Advantages of the ER Design

## Reduced Redundancy

Data is separated into logical entities to avoid duplication.

---

## Improved Scalability

New features and entities can be added easily.

---

## Better Data Integrity

Foreign keys maintain valid relationships between records.

---

## Easier Maintenance

Each table stores only related information.

---

## Efficient Querying

Normalized structure improves SQL query performance.

---

# Conclusion

The ER Diagram for the Campus Lost & Found Management System provides a clear representation of the database architecture and entity relationships.

The design ensures:

- Proper normalization
- Efficient relational mapping
- Strong data consistency
- Reduced redundancy
- Better scalability

The ER model forms the foundation for implementing the PostgreSQL database used in the project.