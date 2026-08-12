# Talora — Sequential Implementation Roadmap

This document outlines the sequential implementation plan broken down into 17 GitHub issues across 6 development phases.

---

## Phase 1: Core Foundation & Database Schema

### 1. Setup Prisma Database Schema & Initial Migrations
- **File:** `packages/database/prisma/schema.prisma`
- **Description:** Implement PostgreSQL relational models (`User`, `CourseOffering`, `Group`, `GroupMembership`, etc.) and enforce `@@unique([studentId, offeringId])` for single active membership per student per offering.

### 2. Implement Domain Models and Identifier Validation Logic
- **File:** `packages/domain/src/validators/identifier.ts`, `packages/domain/src/rules/groupRules.ts`
- **Description:** Implement validation rules for student numbers (`YY007XXXXX`), registration numbers (`YY/U/XXXXX`), year prefix consistency (`YY`), group min/max capacity, and group status derivation.

### 3. Implement Scope-Based Authorization Policy Engine
- **File:** `packages/auth/src/index.ts`
- **Description:** Build RBAC and scope evaluation logic for `PLATFORM_ADMIN`, `CLASS_REPRESENTATIVE`, `GROUP_LEADER`, and `STUDENT` across institution, class/cohort, offering, and group scopes.

### 4. Implement OpenAPI 3.0 Contract Definitions and Client Generators
- **File:** `packages/contracts/openapi.yaml`
- **Description:** Complete OpenAPI specification for `/api/v1/*` endpoints and setup contract TypeScript interface exports.

---

## Phase 2: Authentication & Academic Scope Setup

### 5. User Authentication & Role Assignment API (FR-1)
- **Description:** Implement `/api/v1/auth/login`, session/token verification, and `/api/v1/me`. Enforce secure HTTP-only cookies for web and OAuth 2.0 PKCE for Flutter mobile.

### 6. Academic Structure & Roster Management API (FR-2)
- **Description:** Implement CRUD endpoints for terms, course units, offerings, and timetable events (`/api/v1/institutions/{id}/terms`, `/api/v1/classes/{id}/enrollments`, `/api/v1/timetable-events`).

---

## Phase 3: Group Formation, Rules & Change Workflows

### 7. Group Rule Configuration & Group Creation Engine (FR-3 & FR-4)
- **Description:** Build group policy configuration (`/api/v1/offerings/{offeringId}/group-policy`) and group creation endpoints. Enforce min/max size and single membership under concurrent requests.

### 8. Group Invitations & Membership Join Requests (FR-4)
- **Description:** Implement invitation pipeline (`/api/v1/groups/{groupId}/invitations`) and open group join requests with explicit student acceptance.

### 9. Group Change Request & Approval Workflow (FR-5)
- **Description:** Build group change request submission and representative approval API (`/api/v1/group-change-requests`) with atomic database transactions.

---

## Phase 4: Excel Import/Export & Background Worker

### 10. Asynchronous Excel Roster Import Worker (FR-2 & FR-10)
- **Description:** Implement roster import pipeline (`/api/v1/imports`) in `@talora/worker` with row validation preview, formula injection protection (`=`), and checksum deduplication.

### 11. Asynchronous Group & Submission Export Worker (FR-10)
- **Description:** Implement export job generation (`/api/v1/exports`) in `@talora/worker` for group lists and submission registers with formula escaping and signed download URLs.

---

## Phase 5: Communications, Assignments, Submissions & Issues

### 12. Tagged Announcements & In-App Notification Outbox (FR-6 & FR-9)
- **Description:** Build announcements API (`/api/v1/announcements`) and async notification fan-out worker using transactional outbox pattern.

### 13. Assignment Publishing & Protected Submissions System (FR-7)
- **Description:** Implement assignment creation (`/api/v1/assignments`) and student file submission API (`/api/v1/submissions`) with deadline policies and signed upload URLs.

### 14. Student Issues & Representative Triage System (FR-8)
- **Description:** Implement student issue reporting (`/api/v1/issues`), privacy scopes, and representative triage/resolution workflows.

---

## Phase 6: Frontend Portals & Observability

### 15. Next.js Representative & Administrator Dashboard UI (FR-11)
- **Description:** Build responsive web UI dashboard in `apps/web` for representatives to manage rosters, review group changes, triage issues, and export lists.

### 16. Flutter Student Mobile Client Application (FR-11)
- **Description:** Implement Flutter mobile app in `apps/mobile` for student group discovery, invitation inbox, announcements, timetable, and assignment submissions.

### 17. Observability, Audit Trail & Security Hardening (FR-12)
- **Description:** Implement structured logging, metrics, audit outbox logging, rate limiting on sensitive endpoints, and security controls across all services.
