# Talora — University Course Management

This repository contains a monorepo for the Talora course management system. It includes a Node/Express backend (server) and a Next.js frontend (client).

Overview
- `server/` — Express + TypeScript API, Prisma ORM, Postgres integration.
- `client/` — Next.js (App Router), React components, Tailwind CSS.

Key features
- Group management, submissions, complaints, timetable endpoints.
- Prisma schema and seed scripts under `server/prisma`.
- Docker compose for local development (`docker-compose.yml`).
- GitHub Actions CI that runs install, Prisma generate, builds and tests.

Quickstart (local)
1. Install dependencies:
```bash
npm run install:all
```
2. Copy example env and update values:
```bash
cp .env.example .env
# edit .env as needed
```
3. Start dev servers:
```bash
npm run dev
```
4. Open the frontend at `http://localhost:3000` (or next available port) and the API at `http://localhost:5000`.

Docker (local PostgreSQL)
```bash
docker-compose up -d
```

Testing
```bash
npm test
```

Lint and formatting
```bash
npm run lint
npm run format
```

CI
The repository contains a GitHub Actions workflow at `.github/workflows/ci.yml` that runs the build and tests on push and PRs to `main`.

Contributing
See `CONTRIBUTING.md` for contribution guidelines.

License
This project is licensed under the MIT License. See `LICENSE`.
