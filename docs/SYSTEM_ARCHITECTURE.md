# Talora — System Architecture Document

**Version:** 1.1
**Last Updated:** August 2026
**Architecture Style:** API-first Modular Monolith
**Primary Stack:** Next.js (Vercel), Flutter, Serverless PostgreSQL (Neon), Brevo SMTP

---

## 1. Architecture Objectives

The architecture enforces course-scoped permissions, preserves group membership integrity under concurrent requests, supports self-service student enrollment, delivers notifications reliably, and serves both web and mobile clients from a consistent API.

For the MVP, a **modular monolith** is used over independent microservices. It provides clear domain boundaries and transactional consistency without the deployment and operational cost of a distributed system.

---

## 2. Container Architecture

- **Clients:** Next.js Web UI, Flutter Mobile App
- **Application:** Next.js API / Serverless Functions (deployed to Vercel)
- **Data & Providers:**
  - Serverless PostgreSQL (System of Record) via Neon
  - **Email:** Brevo SMTP relay (`smtp-relay.brevo.com:587`) for OTP verification codes and notification emails
- **Security & Routing:** Next.js Middleware protects internal `/api/v1` routes and the dashboard, while explicitly whitelisting public auth routes (`/login`, `/register`, `/forgot-password`, `/verify`, `/reset-password`).

---

## 3. Application Modules & Monorepo Layout

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
- **Roster Composition:** Class rosters dynamically query and combine `Enrollment` and `GroupMembership` entities to guarantee consistent grouping data upon export. Ungrouped student counts are strictly filtered to enrolled students to prevent phantom counts.
- **URL-based Submissions:** Eliminate the need for costly Object Storage systems.

---

## 5. Authentication & Security

- **JWT-based Auth:** Stateless JWTs stored in HTTP-only cookies (web).
- **OTP Verification:** Registration and password resets are guarded by 6-digit time-limited One-Time Passwords delivered via Brevo SMTP. Tokens are stored (hashed) on the `User` model with a 15-minute expiry:
  - `verificationToken` / `verificationTokenExpires` — for new registrations
  - `resetToken` / `resetTokenExpires` — for password resets
- **Rate Limiting:** Sensitive auth endpoints are protected by a configurable rate limiter (`@/lib/rateLimit`).
- **RBAC:** Roles (`PLATFORM_ADMIN`, `CLASS_REPRESENTATIVE`, `GROUP_LEADER`, `STUDENT`) are scoped to institution/class/offering via the `UserRole` model.
- **Middleware:** Whitelist-based Next.js middleware protects all dashboard and API routes.

---

## 6. Notification Architecture

Notifications are stored in the `Notification` model and linked to their source records via two optional fields:
- `referenceId` — the ID of the source record (e.g., an Announcement's `id`)
- `referenceType` — the type discriminator (e.g., `"ANNOUNCEMENT"`)

This design enables **atomic lifecycle management**: when the source record is deleted (e.g., a Class Rep deletes an announcement), the DELETE handler runs a Prisma `$transaction` that wipes all linked `Notification` records before deleting the source, ensuring no orphan notifications remain for users.

Notifications are currently generated for:
- **New Announcements** — fan-out to all enrolled students in the offering
- **New Assignments** — fan-out to all enrolled students in the offering
- **Issue Status Updates** — targeted to the student who raised the issue

---

## 7. Group Management Design

- Groups belong to a `CourseOffering` and have a configurable min/max size.
- **GroupMembership** is unique per `(studentId, offeringId)` — a student can only be in one group per offering.
- **GroupPlaceholder** allows Group Leaders and Class Reps to reserve spots by student number for students not yet registered on the platform.
- **Ungrouped Count:** The groups dashboard calculates ungrouped students as `enrolledCount - membershipsCount`, where `membershipsCount` strictly filters memberships by students who have an active `Enrollment` for the same offering, preventing negative counts.
- Group status (`FORMING`, `COMPLETE`, `INCOMPLETE`, `LOCKED`, `ARCHIVED`) transitions automatically based on membership size relative to the min/max rules.

---

## 8. Data Model Summary

See [ERD.md](ERD.md) for the full entity relationship diagram.

Key models:

| Model | Purpose |
| --- | --- |
| `User` | Students, reps, admins. Includes OTP token fields. |
| `Institution` | Top-level org unit |
| `AcademicTerm` | Semester/year with `isCurrent` flag |
| `ClassCohort` | Year group / intake cohort |
| `CourseUnit` | Subject definition with optional lecturer details |
| `CourseOffering` | Joins `CourseUnit` × `AcademicTerm` × `ClassCohort`, holds group size rules |
| `Enrollment` | Student ↔ Offering registration |
| `Group` | A student group within an offering |
| `GroupMembership` | Student ↔ Group assignment (unique per offering) |
| `GroupPlaceholder` | Reserved spot by student number for unregistered users |
| `GroupChangeRequest` | Student request to switch groups, pending approval |
| `Announcement` | Rep-authored announcements per offering |
| `Assignment` | Coursework tasks per offering with due dates |
| `Submission` | URL-based student submission per assignment |
| `Notification` | User-targeted alert, with `referenceId`/`referenceType` for lifecycle management |
| `AuditLog` | Immutable action trail (userId set to NULL on user deletion) |
| `PasswordResetRequest` | Legacy model — superseded by the OTP reset flow. Retained for historical data. |
