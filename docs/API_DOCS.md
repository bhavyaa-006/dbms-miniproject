# API Documentation — Campus Lost & Found

Base URL: `http://localhost:8000/api`  
Interactive Swagger UI: `http://localhost:8000/docs`

---

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth Endpoints

### POST `/auth/register`
Register a new student account.

**Body:**
```json
{ "name": "Alice", "email": "alice@campus.edu", "password": "alice123" }
```
**Response:** `201` — `{ access_token, token_type, user }`

---

### POST `/auth/login`
Login and receive a JWT.

**Body:**
```json
{ "email": "alice@campus.edu", "password": "alice123" }
```
**Response:** `200` — `{ access_token, token_type, user }`

---

### GET `/auth/me` 🔒
Get currently authenticated user.

**Response:** `200` — `UserOut`

---

## Categories

### GET `/categories` 🔒
List all item categories.

**Response:** `200` — `[{ id, name, description }]`

---

## Lost Items

### GET `/lost-items` 🔒
List lost items. Supports query params: `search`, `category_id`, `status`.

### POST `/lost-items` 🔒
Report a new lost item. **Form data** (multipart):

| Field | Type | Required |
|---|---|---|
| `title` | string | ✅ |
| `category_id` | string | ✅ |
| `date_lost` | date (YYYY-MM-DD) | ✅ |
| `description` | string | ❌ |
| `location` | string | ❌ |
| `image` | file | ❌ |

### GET `/lost-items/my` 🔒
Get current user's own lost item reports.

### GET `/lost-items/{id}` 🔒
Get a specific lost item.

### PUT `/lost-items/{id}` 🔒 (owner or admin)
Update a lost item. Same form fields as POST (all optional).

### DELETE `/lost-items/{id}` 🔒 (owner or admin)
Delete a lost item report.

---

## Found Items

### GET `/found-items` 🔒
List found items. Supports: `search`, `category_id`, `status`.

### POST `/found-items` 🔒
Report a found item. Form data (same shape as lost items but `date_found`).

### GET `/found-items/my` 🔒
Current user's found item reports.

### GET `/found-items/{id}` 🔒
Get a specific found item.

### PUT `/found-items/{id}` 🔒 (owner or admin)
Update a found item.

### DELETE `/found-items/{id}` 🔒 (owner or admin)
Delete a found item report.

---

## Claims

### POST `/claims` 🔒
Submit a claim on a found item.

**Body:**
```json
{ "found_item_id": "uuid", "description": "Proof of ownership..." }
```

### GET `/claims` 🔒 Admin only
List all claims.

### GET `/claims/my` 🔒
Get current user's submitted claims.

### PUT `/claims/{id}` 🔒 Admin only
Approve or reject a claim.

**Body:**
```json
{ "status": "APPROVED" }   // or "REJECTED"
```

> **Note:** Approving a claim automatically sets `found_item.status = "CLAIMED"` and creates a notification (handled by both application code and the PostgreSQL trigger).

---

## Notifications

### GET `/notifications` 🔒
Get all notifications for the current user (newest first).

### PUT `/notifications/{id}/read` 🔒
Mark a single notification as read.

### PUT `/notifications/read-all` 🔒
Mark all notifications as read.

---

## Dashboard

### GET `/dashboard/stats` 🔒
Get summary statistics.

**Response:**
```json
{
  "total_lost": 12,
  "total_found": 8,
  "pending_claims": 3,
  "resolved_items": 5
}
```

---

## Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `204` | No Content (deleted) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Not Found |
