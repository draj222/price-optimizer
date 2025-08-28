# Deployment Guide

## Backend API (FastAPI)

### Render.com
- Create a new Web Service from your GitHub repo.
- Use Dockerfile build.
- Set environment variables from `.env.example`.
- Expose port 8000.
- Add health check path: `/health`.

### Fly.io
- Install Fly CLI: https://fly.io/docs/hands-on/install/
- Run `fly launch` in the backend directory.
- Set secrets/env vars as per `.env.example`.
- Expose port 8000.
- Set health check to `/health`.

## Database (Postgres)

### Neon
- Create a new project at https://neon.tech/
- Copy the connection string to `DATABASE_URL` in your backend env.

### Supabase
- Create a new project at https://supabase.com/
- Use the provided Postgres connection string for `DATABASE_URL`.

## Frontend (Next.js)

### Vercel
- Import your repo in Vercel.
- Set environment variables from `.env.example` (e.g. `NEXT_PUBLIC_API_BASE`).
- Deploy.

---

For local dev, see the README for run instructions.
