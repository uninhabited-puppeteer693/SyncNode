# SyncNode ⚡️

> A modern, enterprise-grade issue tracking and team collaboration platform.

**SyncNode** is a full-stack, multi-tenant issue tracking system built for performance, security, and scalability. It combines a robust **FastAPI (Python)** backend with a highly responsive **React + Tailwind** frontend, featuring advanced Role-Based Access Control (RBAC) and real-time audit logging.

---

## ✨ Key Features

- **🏢 Multi-Tenant Architecture**  
  Complete data isolation between company workspaces.

- **🔐 Enterprise-Grade Security**  
  JWT-based authentication with strict token handling, HttpOnly-ready architecture, and seamless multi-tab session synchronization.

- **🛡️ Advanced RBAC System**  
  A 6-tier permission model *(Superadmin, Owner, Admin, IT, Manager, Developer)* controlling access, actions, and visibility.

- **📋 Immutable Audit Logs**  
  Every issue mutation is tracked with full actor attribution and chronological history.

- **🛠️ IT Administration Tools**  
  Built-in capabilities for password resets, account recovery, and user management.

- **🎨 Modern UI/UX**  
  Built with React 19 and Tailwind CSS v4, featuring dark mode and optimistic UI updates for a smooth experience.

---

## 🏗️ Tech Stack

### Backend
- **Framework:** FastAPI (Python)  
- **Database:** MySQL (SQLAlchemy ORM)  
- **Migrations:** Alembic  
- **Security:** Passlib (Bcrypt), Python-JOSE (JWT)  
- **Email Service:** Resend API  

### Frontend
- **Framework:** React 19 + Vite  
- **Styling:** Tailwind CSS v4  
- **Routing:** React Router v7  
- **HTTP Client:** Axios  

---

## 📂 Project Structure

This project follows a **monorepo architecture**, containing both backend and frontend:

```text
syncnode/
├── app/                  # FastAPI backend
│   ├── core/             # Configuration & settings
│   ├── db/               # Database engine & session handling
│   ├── models/           # SQLAlchemy models
│   ├── routers/          # API routes (endpoints)
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic layer
├── frontend/             # React (Vite) frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Global state (AuthContext)
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Route-level pages
│   │   └── services/     # API communication (Axios)
├── alembic/              # Migration versions
├── .env.example          # Environment variables template
├── requirements.txt      # Python dependencies
├── seed.py               # Development data seeder
└── nuke.py               # Database reset utility
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- MySQL Server (local or cloud)

---

### 1️⃣ Backend Setup

> Copy `.env.example` to `.env` and configure your database and API keys before starting.

```bash
# Clone the repository
git clone https://github.com/Gallos7/SyncNode.git
cd syncnode

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
alembic upgrade head

# Start the backend
uvicorn app.main:app --reload
```

Backend runs at: **http://localhost:8000**

---

### 2️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🛠️ Developer Tools

Make sure your virtual environment is active before running these.

### 🌱 Seed the Database

Populates the database with sample data:
- 4 companies *(SyncNode System, TechFlow Inc, SoftSolutions, Innovate Ltd)*
- 5 users (Including a global Superadmin)
- Sample issues

```bash
python seed.py
```

**Test credentials (Password is `password123` for all):**
- **Superadmin:** `superadmin@syncnode.com` (Has global IT access)
- **Standard Admin:** `alex@techflow.com`

---

### 🧨 Nuke the Database

⚠️ **Danger zone** — completely resets the database.

```bash
python nuke.py
```

---

<div align="center">
  <p><i>Developed by Parissis Dimitris</i></p>
</div>