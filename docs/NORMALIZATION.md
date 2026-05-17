# Database Normalization — Campus Lost & Found System

This document explains the normalization process followed in the Campus Lost & Found Management System database design.  
The database has been normalized up to Third Normal Form (3NF) to reduce redundancy, improve consistency, and maintain data integrity.

---

# Introduction to Normalization

Normalization is the process of organizing data in a database to minimize redundancy and dependency issues.  
It helps in:

- Eliminating duplicate data
- Improving data consistency
- Reducing update anomalies
- Enhancing database maintainability
- Improving query efficiency

The database schema used in this project follows:

- First Normal Form (1NF)
- Second Normal Form (2NF)
- Third Normal Form (3NF)

---

# Initial Unnormalized Structure (UNF)

Initially, all data could have been stored in a single table:

| User Name | Email | Lost Item | Found Item | Claim Status | Notification |
|------------|--------|------------|-------------|---------------|---------------|
| Rahul | rahul@gmail.com | Wallet | Bottle | Pending | Claim Submitted |

This structure leads to:

- Data redundancy
- Repeated user information
- Difficulty in updates
- Insert and delete anomalies

Therefore, normalization was applied.

---

# First Normal Form (1NF)

## Definition

A relation is in First Normal Form if:

- All attributes contain atomic values
- No repeating groups exist
- Each record is unique

---

## Conversion to 1NF

Separate tables were created for:

- Users
- Lost Items
- Found Items
- Claims
- Notifications

---

## Users Table

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    password_hash TEXT,
    role VARCHAR(20)
);
```

---

## Lost Items Table

```sql
CREATE TABLE lost_items (
    lost_id SERIAL PRIMARY KEY,
    user_id INT,
    item_name VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    location_lost VARCHAR(100)
);
```

---

## Result of 1NF

- Repeating groups removed
- Atomic values maintained
- Better data organization achieved

---

# Second Normal Form (2NF)

## Definition

A table is in Second Normal Form if:

- It is already in 1NF
- All non-key attributes are fully dependent on the primary key
- No partial dependency exists

---

## Problem Before 2NF

Suppose the following structure existed:

| claim_id | claimant_name | claimant_email | found_item |
|-----------|----------------|-----------------|-------------|

Here:

- claimant_name depends on claimant_id
- claimant_email depends on claimant_id
- Not directly dependent on claim_id

This causes partial dependency.

---

## Conversion to 2NF

Claimant details were separated into the `users` table.

Claims table stores only references:

```sql
CREATE TABLE claims (
    claim_id SERIAL PRIMARY KEY,
    found_id INT REFERENCES found_items(found_id),
    claimant_id INT REFERENCES users(user_id),
    claim_status VARCHAR(20)
);
```

---

## Result of 2NF

- Partial dependency removed
- User information stored only once
- Improved consistency

---

# Third Normal Form (3NF)

## Definition

A table is in Third Normal Form if:

- It is already in 2NF
- No transitive dependency exists
- Non-key attributes depend only on the primary key

---

## Problem Before 3NF

Suppose category names were repeatedly stored:

| item_id | category_id | category_name |
|----------|--------------|----------------|

Here:

- category_name depends on category_id
- Not directly dependent on item_id

This creates transitive dependency.

---

## Conversion to 3NF

A separate categories table was created:

```sql
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50)
);
```

Lost and found items reference category IDs:

```sql
CREATE TABLE found_items (
    found_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id),
    item_name VARCHAR(100)
);
```

---

## Result of 3NF

- Transitive dependency removed
- Category data centralized
- Easier maintenance and updates

---

# Final Normalized Tables

The final database consists of the following normalized tables:

| Table Name | Purpose |
|-------------|----------|
| users | Stores user information |
| lost_items | Stores lost item reports |
| found_items | Stores found item reports |
| claims | Stores ownership claims |
| notifications | Stores user notifications |
| categories | Stores item categories |

---

# Relationships Between Tables

## Users ↔ Lost Items

- One user can report many lost items
- Relationship: One-to-Many

---

## Users ↔ Found Items

- One user can report many found items
- Relationship: One-to-Many

---

## Users ↔ Claims

- One user can submit many claims
- Relationship: One-to-Many

---

## Found Items ↔ Claims

- One found item can have multiple claims
- Relationship: One-to-Many

---

## Categories ↔ Items

- One category can belong to many items
- Relationship: One-to-Many

---

# Advantages of Normalization in This Project

## Reduced Data Redundancy

User details and category names are stored only once.

---

## Improved Data Consistency

Updating a user email updates it everywhere automatically.

---

## Better Storage Efficiency

Duplicate records are minimized.

---

## Easier Maintenance

Changes can be made in one place without affecting multiple records.

---

## Improved Data Integrity

Foreign key relationships ensure valid references between tables.

---

# Example of Foreign Key Usage

```sql
ALTER TABLE lost_items
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES users(user_id);
```

---

# Example of Referential Integrity

If a user is deleted:

```sql
ON DELETE CASCADE
```

Automatically removes related records.

This prevents orphan records in the database.

---

# Conclusion

The Campus Lost & Found Management System database has been normalized up to Third Normal Form (3NF).  
Normalization helped eliminate redundancy, improve consistency, and maintain efficient relational mapping between tables.

The final schema ensures:

- Efficient storage
- Better scalability
- Reliable data integrity
- Easier maintenance
- Improved query performance

The normalized database design makes the system robust and suitable for real-world deployment.