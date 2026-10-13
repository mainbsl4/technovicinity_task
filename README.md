# VORTEX MES — Manufacturing Execution System

Enterprise Manufacturing Execution System featuring Raw Materials Inventory, Bill of Materials (BOM) Recipes, Production Run Lifecycle Tracking, and Automated Scrap/Waste Routing.

---

## Architecture & Tech Stack

- **Backend**: Django 6 + Django REST Framework + Gunicorn + SQLite (persisted volume)
- **Frontend**: Next.js 16 (Turbopack, App Router) + React 19 + Redux Toolkit + Tailwind CSS v4
- **Containerization**: Docker & Docker Compose (Multi-stage build, Next.js standalone optimization, healthchecks)

---

## Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20+ with Docker Compose v2+)

### 1. Build & Run Containers
To spin up both backend and frontend in detached mode:
```bash
docker compose up -d --build
```

### 2. Access the Application
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Django REST API**: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

### 3. Check Status & Logs
```bash
# Check service health and running status
docker compose ps

# View container logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend
```

### 4. Stop Containers
```bash
# Stop and remove containers (preserves database volume)
docker compose down

# Stop and wipe database volume for a clean slate
docker compose down -v
```

---

## Service Configuration

| Service | Container Name | Port | Description |
|---|---|---|---|
| `backend` | `vortex-backend` | `8000` | Django REST Framework API with Gunicorn |
| `frontend` | `vortex-frontend` | `3000` | Next.js 16 standalone production app |

### Environment Variables (.env)
You can customize settings by creating a `.env` file based on `.env.example`:

```env
# Backend
DEBUG=True
ALLOWED_HOSTS=*
SQLITE_DB_PATH=/data/db.sqlite3

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
PORT=3000
```

---

## Local Development (Without Docker)

### Backend
```bash
cd backend
.\venv\Scripts\activate
python manage.py migrate
python seed_data.py
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
