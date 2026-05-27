# Campus Lost & Found Management System

<!-- Repository Badges -->
<p align="left">
  <img src="https://img.shields.io/github/repo-size/bhavyaa-006/dbms-miniproject?style=flat-square" alt="Repo Size">
  <img src="https://img.shields.io/github/contributors/bhavyaa-006/dbms-miniproject?style=flat-square&color=blue" alt="Contributors">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
</p>

A centralized web-based platform designed to simplify the process of reporting, tracking, and claiming lost and found items within a college campus.

The system allows students to report lost items, upload found item details, submit ownership claims, and receive notifications regarding claim verification. The project was developed as a DBMS mini project with focus on database design, normalization, relational mapping, and backend integration.

---

# Live Demo

**Project Deployment:** [https://dbms-miniproject-sigma.vercel.app/](https://dbms-miniproject-sigma.vercel.app/)

<p align="center">
  <img src="docs/images/dashboard-preview.png" alt="Application Dashboard Preview" width="800">
</p>

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

<p align="center">
  <img src="docs/images/report-lost.png" alt="Report Lost Item Interface" width="700">
</p>

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

<p align="center">
  <img src="docs/images/claim-verification.png" alt="Claim Verification Dashboard" width="700">
</p>

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
| **FastAPI** | Backend framework |
| **PostgreSQL** | Relational database |
| **SQLAlchemy** | ORM (Object Relational Mapper) |
| **React** | Frontend interface |
| **Tailwind CSS** | UI styling and layout |
| **JWT** | Secure token authentication |
| **Docker** | Application containerization |

---

# Database Design

The database is normalized up to Third Normal Form (3NF) to reduce redundancy and maintain consistency.

Main tables used in the project:
- `users`
- `lost_items`
- `found_items`
- `claims`
- `notifications`
- `categories`

The schema uses:
- Primary Keys and Foreign Keys
- Database Constraints and Triggers
- Core Views and Performance Indexing

---

# Entity Relationships

The project follows a structured relational database architecture:
- One user can report multiple lost items
- One user can report multiple found items
- One user can submit multiple claims
- One found item can receive multiple claims
- Categories are shared dynamically across items

### ER Diagram
<p align="center">
  <img src="docs/images/er-diagram.png" alt="Entity Relationship Diagram" width="700">
</p>

---

# API Architecture

The backend follows clean REST API principles. All protected routes require a valid JWT bearer token.

### System Architecture Layout
<p align="center">
  <img src="docs/images/architecture-diagram.png" alt="System Architecture Diagram" width="600">
</p>

Main API modules include:
- Authentication APIs
- Lost item APIs
- Found item APIs
- Claim APIs
- Notification APIs
- Dashboard APIs

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
│   └── images/          # Save your README screenshot assets here
├── docker-compose.yml
├── requirements.txt
└── README.md
