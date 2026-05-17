# Campus Lost & Found Management System

A centralized web-based platform designed to simplify the process of reporting, tracking, and claiming lost and found items within a college campus.

The system allows students to report lost items, upload found item details, submit ownership claims, and receive notifications regarding claim verification. The project was developed as a DBMS mini project with focus on database design, normalization, relational mapping, and backend integration.

---

# Problem Statement

In many colleges, lost items are usually handled manually through notice boards, student groups, or word of mouth. This approach often leads to:

- Lack of centralized tracking
- Delayed communication
- Duplicate reports
- Difficulty in verifying ownership
- Poor record management

The Campus Lost & Found Management System solves these problems by providing a structured digital platform for managing lost and found items efficiently.

---

# Objectives

- Create a centralized portal for lost and found item management
- Allow students to report lost and found items easily
- Enable ownership claim verification
- Maintain proper database records
- Reduce duplicate and unverified claims
- Demonstrate practical implementation of DBMS concepts

---

# Features

## User Authentication

- Secure login and registration
- JWT-based authentication
- Role-based access system

---

## Lost Item Management

- Report lost items
- Add item descriptions and locations
- Upload item images
- Track item status

---

## Found Item Management

- Report found items
- Store recovery location and date
- Upload images for verification
- Mark items as claimed

---

## Claim Verification System

- Submit ownership claims
- Provide proof descriptions
- Approve or reject claims
- Automatic item status updates

---

## Notification System

- Claim status notifications
- Read/unread notification tracking
- User-specific alerts

---

## Dashboard and Analytics

- Total lost and found item statistics
- Pending claim monitoring
- Category-wise analysis
- Activity tracking

---

# Tech Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | Backend framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM |
| React | Frontend |
| Tailwind CSS | UI styling |
| JWT | Authentication |
| Docker | Containerization |

---

# Database Design

The database is normalized up to Third Normal Form (3NF) to reduce redundancy and maintain consistency.

Main tables used in the project:

- users
- lost_items
- found_items
- claims
- notifications
- categories

The schema uses:

- Primary Keys
- Foreign Keys
- Constraints
- Triggers
- Views
- Indexing

---

# Entity Relationships

The project follows a relational database structure:

- One user can report multiple lost items
- One user can report multiple found items
- One user can submit multiple claims
- One found item can receive multiple claims
- Categories are shared across items

---

# API Architecture

The backend follows REST API principles.

Main API modules include:

- Authentication APIs
- Lost item APIs
- Found item APIs
- Claim APIs
- Notification APIs
- Dashboard APIs

All protected routes use JWT authentication.

---

# Folder Structure

```text
project-root/
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── database/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── docs/
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# Installation and Setup

## Clone the Repository

```bash
git clone https://github.com/bhavyaa-006/dbms-miniproject.git
```

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/campus_lost_found
SECRET_KEY=your_secret_key
```

---

## Run PostgreSQL

Make sure PostgreSQL is installed and running.

Create the database:

```sql
CREATE DATABASE campus_lost_found;
```

---

## Start Backend Server

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Sample Workflow

1. User registers and logs in
2. User reports a lost item
3. Another user reports a found item
4. Original owner submits a claim
5. Admin verifies the claim
6. Item status changes to claimed
7. Notification is sent to the user

---

# DBMS Concepts Implemented

- Entity Relationship Model
- Normalization (up to 3NF)
- Primary and Foreign Keys
- Joins
- Aggregate Functions
- Subqueries
- Views
- Indexing
- Triggers
- Transactions
- Stored Procedures

---

# Security Features

- Password hashing
- JWT authentication
- Protected API routes
- Input validation using Pydantic
- Secure database transactions

---

# Future Improvements

- Real-time notifications
- AI-based item matching
- QR code verification
- Email integration
- Mobile application support
- Admin analytics dashboard

---

# Conclusion

The Campus Lost & Found Management System demonstrates the practical implementation of database management concepts in a real-world application.

The project combines:

- Structured relational database design
- RESTful backend development
- Secure authentication
- Efficient claim verification workflow
- Clean and responsive frontend design

It serves as a complete DBMS mini project showcasing database architecture, normalization, SQL operations, API integration, and modern web development practices.