# Talora — System Architecture Document

**Version:** 1.0  
**Architecture Style:** API-first Modular Monolith
**Primary Stack:** Next.js (Vercel), Flutter, Serverless PostgreSQL (Neon)

---

## 1. Architecture Objectives
The architecture enforces course-scoped permissions, preserves group membership integrity under concurrent requests, supports self-service student enrollment, delivers notifications reliably, and serves both web and mobile clients from a consistent API.

For the MVP, a **modular monolith** is used over independent microservices. It provides clear domain boundaries and transactional consistency without the deployment and operational cost of a distributed system.

---

## 2. Container Architecture
- **Clients:** Next.js Web UI, Flutter Mobile App
- **Application:** Next.js API / Serverless Functions
- **Data & Providers:** Serverless PostgreSQL (System of Record), Email / Push providers

---

## 3. Application Modules & Monorepo Layout
The repository is structured as a monorepo under `apps/` and `packages/`:

```
talora/
├── apps/
│   ├── web/          # Next.js Web UI & API adapters (/api/v1)
│   ├── mobile/       # Flutter student-first mobile application
├── packages/
│   ├── domain/       # Business logic, entities, validators, group rules
│   ├── database/     # Prisma schema, migrations, DB service
│   ├── contracts/    # OpenAPI 3.0 specification & generated clients
│   ├── auth/         # Role-based & scope-based authorization policies
│   └── observability/# Structured logger, audit trail outbox, metrics
├── infrastructure/
│   ├── containers/   # Dockerfiles & docker-compose setups
│   └── deployment/   # Deployment specs & Helm charts
└── docs/             # Technical architecture & PRD documentation
```

---

## 4. API & Data Design
- Base API path: `/api/v1`
- JSON over HTTPS with OpenAPI 3.0 contract (`packages/contracts`)
- PostgreSQL provides strict transactional integrity:
  - Unique active membership on `(student_id, offering_id)`
  - One active leader per group
  - Group capacity constraints enforced via atomic predicates / database locking
- URL-based submissions eliminate the need for costly Object Storage systems.
