# AttendTrack — Docker Setup Guide

A full-stack Student Attendance Tracker with a React frontend, Express/Prisma backend, and PostgreSQL database — all containerized with Docker.

---

## Project Structure

```
AttendTrack/
├── client/               # Vite + React frontend
│   ├── Dockerfile
│   └── .dockerignore
├── server/               # Express + Prisma backend
│   ├── Dockerfile
│   ├── .dockerignore
│   └── prisma/
│       └── schema.prisma
└── docker-compose.yaml
```

---

## Files Created

### `client/Dockerfile`

Multi-stage build to keep the final image small:

```dockerfile
# Stage 1: Build the Vite app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./        # Only package.json — NOT package-lock.json (see gotchas)
RUN npm install
COPY . .
RUN npm run build           # Produces /app/dist

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix React Router — without this, refreshing /groups gives nginx a 404
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why two stages?** Stage 1 needs Node + all dev dependencies to compile the app. Stage 2 only needs nginx to serve the static files — the final image has no Node in it, making it much leaner.

---

### `server/Dockerfile`

```dockerfile
FROM node:18-alpine
# Prisma's schema engine binary requires OpenSSL — Alpine doesn't ship it
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate     # Generates the Prisma Client from schema (build time, no DB needed)
EXPOSE 5001
# At container startup: apply DB migrations first, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
```

**Key decisions:**
- `prisma generate` runs at **build time** → just generates TypeScript client from schema, no DB needed ✅
- `prisma migrate deploy` runs at **startup** → applies migrations against the live database ✅
- `prisma migrate dev` must **never** be used in Docker — it's interactive and requires a prompt ❌

---

### `client/.dockerignore` and `server/.dockerignore`

```
# client/.dockerignore
node_modules
dist
.env
.env.local
.DS_Store

# server/.dockerignore
node_modules
.env
.DS_Store
```

These prevent local `node_modules` and `.env` files from being sent to the Docker build context. Without these, the build was failing with `npm error Invalid Version` because the corrupted local `node_modules` was being included.

---

### `docker-compose.yaml`

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: attendtrack-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: student_attendance
    volumes:
      - postgres_data:/var/lib/postgresql/data   # Persist data across restarts
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build: ./server
    container_name: attendtrack-server
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy   # Wait for Postgres to be ready before starting
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/student_attendance
      JWT_SECRET: student-attendance-super-secret-jwt-2024
      PORT: 5001
      CLIENT_URL: http://localhost
      EMAIL_USER: ${EMAIL_USER:-}
      EMAIL_PASS: ${EMAIL_PASS:-}
    ports:
      - "5001:5001"

  client:
    build: ./client
    container_name: attendtrack-client
    restart: unless-stopped
    depends_on:
      - server
    ports:
      - "80:80"

volumes:
  postgres_data:
```

**Important:** Inside Docker, services communicate using their **service name as hostname**, not `localhost`. So `DATABASE_URL` uses `@db:5432` (the service name is `db`), not `@localhost:5432`.

---

## Running the Stack

```bash
# First time (or after any Dockerfile change)
docker-compose up --build

# Subsequent starts (no code changes)
docker-compose up

# Run in background (detached)
docker-compose up -d

# Stop everything
docker-compose down

# Stop and delete DB data (full reset)
docker-compose down -v
```

---

## Testing

### 1. Verify all containers are running
```bash
docker-compose ps
# All three should show "Up"
```

### 2. Backend health check
```bash
curl http://localhost:5001/api/health
# {"status":"ok","timestamp":"..."}
```

### 3. Register + Login
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Frontend
Open **http://localhost** in your browser. Register → Create Class → Mark Attendance.

---

## Gotchas & Fixes Encountered

| Issue | Root Cause | Fix |
|---|---|---|
| Login/register broken | Client `axios.js` had `baseURL: localhost:5000` but server runs on `5001` | Changed port to `5001` in `axios.js` |
| `npm error Invalid Version` | `package-lock.json` had a corrupt version entry, and no `.dockerignore` was present | Added `.dockerignore`; changed `COPY package*.json` → `COPY package.json` to skip the lock file |
| `Could not parse schema engine response` | Prisma's native binary needs OpenSSL, which Alpine doesn't include | Added `RUN apk add --no-cache openssl` to server Dockerfile |
| `prisma migrate dev` failing at build | `migrate dev` is interactive and needs a live DB during `docker build` | Moved it to `CMD` at container startup using `migrate deploy` instead |
| DB connection refused | `DATABASE_URL` had `localhost` instead of the `db` service hostname | Changed to `@db:5432` in `docker-compose.yaml` |
