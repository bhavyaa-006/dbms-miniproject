# API Documentation — Campus Lost & Found System

This document describes the REST API endpoints used in the Campus Lost & Found Management System.  
The backend is developed using FastAPI and PostgreSQL.

The APIs handle:

- User authentication
- Lost item management
- Found item management
- Claims processing
- Notifications
- Dashboard operations

---

# Base URL

```text
http://localhost:8000/api
```

---

# Authentication APIs

## 1. Register User

### Endpoint

```http
POST /auth/register
```

---

### Description

Creates a new user account.

---

### Request Body

```json
{
    "full_name": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "password": "password123",
    "role": "student"
}
```

---

### Response

```json
{
    "message": "User registered successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 201 | User created successfully |
| 400 | User already exists |

---

# 2. Login User

### Endpoint

```http
POST /auth/login
```

---

### Description

Authenticates user credentials and returns an access token.

---

### Request Body

```json
{
    "email": "rahul@gmail.com",
    "password": "password123"
}
```

---

### Response

```json
{
    "access_token": "jwt_token_here",
    "token_type": "bearer"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Login successful |
| 401 | Invalid credentials |

---

# Lost Item APIs

## 3. Report Lost Item

### Endpoint

```http
POST /lost-items
```

---

### Description

Allows users to report a lost item.

---

### Request Body

```json
{
    "item_name": "Black Wallet",
    "category": "Accessories",
    "description": "Leather wallet with ID card",
    "location_lost": "Library Block",
    "date_lost": "2026-05-10"
}
```

---

### Response

```json
{
    "message": "Lost item reported successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 201 | Item reported successfully |
| 400 | Invalid request |

---

## 4. Get All Lost Items

### Endpoint

```http
GET /lost-items
```

---

### Description

Fetches all reported lost items.

---

### Response

```json
[
    {
        "lost_id": 1,
        "item_name": "Black Wallet",
        "category": "Accessories",
        "status": "open"
    }
]
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Data fetched successfully |

---

## 5. Get Lost Item by ID

### Endpoint

```http
GET /lost-items/{id}
```

---

### Description

Fetches details of a specific lost item.

---

### Response

```json
{
    "lost_id": 1,
    "item_name": "Black Wallet",
    "description": "Leather wallet",
    "status": "open"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Item found |
| 404 | Item not found |

---

## 6. Delete Lost Item

### Endpoint

```http
DELETE /lost-items/{id}
```

---

### Description

Deletes a lost item report.

---

### Response

```json
{
    "message": "Lost item deleted successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Item deleted |
| 404 | Item not found |

---

# Found Item APIs

## 7. Report Found Item

### Endpoint

```http
POST /found-items
```

---

### Description

Allows users to report a found item.

---

### Request Body

```json
{
    "item_name": "Blue Water Bottle",
    "category": "Bottle",
    "description": "Steel bottle with stickers",
    "location_found": "Cafeteria",
    "date_found": "2026-05-11"
}
```

---

### Response

```json
{
    "message": "Found item reported successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 201 | Item reported successfully |
| 400 | Invalid request |

---

## 8. Get All Found Items

### Endpoint

```http
GET /found-items
```

---

### Description

Fetches all found item reports.

---

### Response

```json
[
    {
        "found_id": 1,
        "item_name": "Blue Water Bottle",
        "status": "unclaimed"
    }
]
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Data fetched successfully |

---

## 9. Get Found Item by ID

### Endpoint

```http
GET /found-items/{id}
```

---

### Description

Fetches details of a specific found item.

---

### Response

```json
{
    "found_id": 1,
    "item_name": "Blue Water Bottle",
    "status": "unclaimed"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Item found |
| 404 | Item not found |

---

## 10. Delete Found Item

### Endpoint

```http
DELETE /found-items/{id}
```

---

### Description

Deletes a found item report.

---

### Response

```json
{
    "message": "Found item deleted successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Item deleted |
| 404 | Item not found |

---

# Claim APIs

## 11. Submit Claim

### Endpoint

```http
POST /claims
```

---

### Description

Allows users to claim ownership of a found item.

---

### Request Body

```json
{
    "found_id": 1,
    "proof_description": "Bottle has Avengers sticker"
}
```

---

### Response

```json
{
    "message": "Claim submitted successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 201 | Claim submitted |
| 400 | Invalid request |

---

## 12. Get All Claims

### Endpoint

```http
GET /claims
```

---

### Description

Fetches all submitted claims.

---

### Response

```json
[
    {
        "claim_id": 1,
        "claim_status": "pending"
    }
]
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Data fetched successfully |

---

## 13. Approve Claim

### Endpoint

```http
PUT /claims/{id}/approve
```

---

### Description

Approves an ownership claim.

---

### Response

```json
{
    "message": "Claim approved successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Claim approved |
| 404 | Claim not found |

---

## 14. Reject Claim

### Endpoint

```http
PUT /claims/{id}/reject
```

---

### Description

Rejects an ownership claim.

---

### Response

```json
{
    "message": "Claim rejected successfully"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Claim rejected |
| 404 | Claim not found |

---

# Notification APIs

## 15. Get User Notifications

### Endpoint

```http
GET /notifications
```

---

### Description

Fetches notifications for the logged-in user.

---

### Response

```json
[
    {
        "notification_id": 1,
        "message": "Your claim has been approved",
        "is_read": false
    }
]
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Notifications fetched |

---

## 16. Mark Notification as Read

### Endpoint

```http
PUT /notifications/{id}/read
```

---

### Description

Marks a notification as read.

---

### Response

```json
{
    "message": "Notification marked as read"
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Notification updated |
| 404 | Notification not found |

---

# Dashboard APIs

## 17. Get Dashboard Statistics

### Endpoint

```http
GET /dashboard/stats
```

---

### Description

Returns dashboard analytics and statistics.

---

### Response

```json
{
    "total_users": 120,
    "total_lost_items": 80,
    "total_found_items": 65,
    "pending_claims": 10
}
```

---

### Status Codes

| Code | Meaning |
|------|----------|
| 200 | Statistics fetched successfully |

---

# Error Response Format

## Standard Error Response

```json
{
    "detail": "Error message here"
}
```

---

# Authentication Method

The API uses JWT-based authentication.

Protected endpoints require:

```http
Authorization: Bearer <token>
```

---

# API Features

- RESTful API architecture
- JWT authentication
- CRUD operations
- Claim verification workflow
- Notification system
- PostgreSQL database integration
- FastAPI backend framework

---

# Technologies Used

| Technology | Purpose |
|------------|---------|
| FastAPI | Backend API framework |
| PostgreSQL | Database management |
| SQLAlchemy | ORM |
| JWT | Authentication |
| Pydantic | Data validation |

---

# Conclusion

The API architecture of the Campus Lost & Found Management System provides a scalable and secure backend for handling item reporting, claim verification, notifications, and dashboard analytics.

The APIs follow REST principles and ensure:

- Secure authentication
- Efficient database interaction
- Modular backend structure
- Easy frontend integration
- Scalable system design