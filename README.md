# Campus Lost & Found Management System

> A 4th Semester DBMS Mini Project | FastAPI + React + PostgreSQL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, React Router v6, Axios |
| Backend | Python 3.10+, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (`python-jose`) + `passlib[bcrypt]` |
| File Upload | `python-multipart` (local `uploads/` folder) |

---

## Project Structure

```
dbms-miniproject/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models (6 tables)
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── security.py      # JWT + bcrypt
│   │   ├── dependencies.py  # Auth guards
│   │   ├── seed.py          # Reference data seeder
│   │   ├── routers/         # API route handlers
│   │   └── utils/           # File upload helper
│   ├── uploads/             # Uploaded images (auto-created)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Auth + Dashboard layouts
│   │   ├── services/        # Axios API calls
│   │   └── context/         # Auth + Toast context
│   ├── index.html
│   └── package.json
├── database/
│   ├── trigger.sql          # PostgreSQL trigger
│   └── seed.sql             # Raw SQL seed data
└── docs/                    # ER diagram, normalization, SQL queries, API docs
```

---

## Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (running locally)

---

### Step 1 — Create Database

```sql
-- In psql or pgAdmin:
CREATE DATABASE lostandfound;
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# For Neon, use the pooled or direct connection string from your Neon project.
# Ensure DATABASE_URL is set in the deployment environment.
# Example:
#   DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/DBNAME?sslmode=require

# Frontend environment:
#   VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
```

---

### Step 3 — Start Backend

```bash
# From backend/ directory (with venv active)
uvicorn app.main:app --reload

# Tables are auto-created on first startup
# API runs at your deployed backend URL
# Swagger UI is available at /docs on the backend
```

---

### Step 4 — Seed Reference Data

```bash
# In a new terminal (with venv active, inside backend/)
python -m app.seed
```

---

### Step 5 — Apply PostgreSQL Trigger

```bash
# Apply the trigger from psql:
psql -U postgres -d lostandfound -f database/trigger.sql
```

---

### Step 6 — Frontend Setup

```bash
cd frontend
npm install
npm run dev

# App runs at: http://localhost:5173
```

---

## Features

- **User Auth** — Register/Login with JWT, bcrypt password hashing, Student/Admin roles
- **Lost Items** — Report, view, search, filter by category/status, delete
- **Found Items** — Report with image, search, filter, claim
- **Claim Workflow** — Student submits claim → Admin approves/rejects → Trigger auto-updates found item status
- **Notifications** — Real-time status updates, mark read/unread
- **Dashboard** — Stats overview (lost, found, pending claims, reunited items)
- **Admin Panel** — View and manage all claims

## DBMS Concepts Included

- Normalization (1NF, 2NF, 3NF) — see `docs/NORMALIZATION.md`
- ER Diagram with all relationships — see `docs/ER_DIAGRAM.md`
- PostgreSQL Trigger on `claims` table — see `database/trigger.sql`
- Complex SQL Queries (joins, aggregates, subqueries) — see `docs/SQL_QUERIES.md`
- Indexes on frequently queried columns
- Foreign key constraints and cascading deletes
