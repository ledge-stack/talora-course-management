# Talora — Sequential Implementation Roadmap

**Last Updated:** August 2026

This document outlines the sequential implementation plan broken down into phases. Items marked ✅ are fully shipped and deployed. Items marked 🔄 are in progress or partially complete. Items marked ⬜ are planned.

---

## Phase 1: Core Foundation & Database Schema ✅

### 1. Setup Prisma Database Schema & Initial Migrations ✅
- **File:** `packages/database/prisma/schema.prisma`
- **Description:** Implemented PostgreSQL relational models (`User`, `CourseOffering`, `Group`, `GroupMembership`, etc.) and enforced `@@unique([studentId, offeringId])` for single active membership per student per offering.

### 2. Implement Domain Models and Identifier Validation Logic ✅
- **File:** `packages/domain/src/validators/identifier.ts`, `packages/domain/src/rules/groupRules.ts`
- **Description:** Implemented validation rules for student numbers (`YY007XXXXX`), registration numbers (`YY/[Letter]/XXXXX` with optional suffix), year prefix consistency (`YY`), group min/max capacity, and group status derivation.

### 3. Implement Scope-Based Authorization Policy Engine ✅
- **File:** `packages/auth/src/index.ts`
- **Description:** Built RBAC and scope evaluation logic for `PLATFORM_ADMIN`, `CLASS_REPRESENTATIVE`, `GROUP_LEADER`, and `STUDENT` across institution, class/cohort, offering, and group scopes.

### 4. Implement OpenAPI 3.0 Contract Definitions ⬜
- **File:** `packages/contracts/openapi.yaml`
- **Description:** OpenAPI specification exists but needs to be updated to reflect new endpoints (OTP auth, assignment management, placeholders, notification referenceId schema).

---

## Phase 2: Authentication & Academic Scope Setup ✅

### 5. User Authentication & Role Assignment API (FR-1) ✅
- **Description:** Implemented `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/verify`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`, and `/api/v1/me`. JWT stored in HTTP-only cookies.
- **Enhancement (Aug 2026):** Full 6-digit OTP email verification via Brevo SMTP for both registration and password reset. The legacy Class Rep manual approval flow was removed.

### 6. Academic Structure & Roster Management API (FR-2) ✅
- **Description:** Implemented CRUD endpoints for terms, course units, offerings, and timetable events. Self-service student enrollment via `/api/v1/me/enrollments`.

---

## Phase 3: Group Formation, Rules & Change Workflows ✅

### 7. Group Rule Configuration & Group Creation Engine (FR-3 & FR-4) ✅
- **Description:** Built group policy configuration and group creation endpoints. Min/max size enforced. Group status transitions (FORMING → COMPLETE → INCOMPLETE → LOCKED).

### 8. Group Membership Management ✅
- **Description:** Students can join open groups, request to join invite-only groups, and leave groups. Group leaders can add/remove members directly.
- **Enhancement (Aug 2026):** `GroupPlaceholder` model added. Leaders and Reps can reserve spots by student number for unregistered users.

### 9. Group Change Request & Approval Workflow (FR-5) ✅
- **Description:** Built group change request submission and representative/leader approval API (`/api/v1/group-change-requests`) with atomic database transactions.

### 10. Bulk Auto-Assign & Force-Assign Ungrouped Students ✅
- **Description:** Class Reps can auto-assign all ungrouped enrolled students to available open groups, or manually force-assign individual students. The Assign Ungrouped modal shows student numbers instead of emails.

---

## Phase 4: Excel Import/Export & Background Worker ✅

### 11. Asynchronous Excel Roster Import ✅
- **Description:** Roster import pipeline (`/api/v1/imports`) with row validation preview, formula injection protection.

### 12. Class Roster Export ✅
- **Description:** Export of group lists and enrollment data sorted by Group Name with formula escaping.

---

## Phase 5: Communications, Assignments, Submissions & Issues ✅

### 13. Tagged Announcements & In-App Notifications (FR-6 & FR-9) ✅
- **Description:** Announcements API with notification fan-out to all enrolled students on creation.
- **Enhancement (Aug 2026):** Notifications extended with `referenceId` and `referenceType`. Announcement deletion atomically purges linked notifications.

### 14. Assignment Publishing & Submission System (FR-7) ✅
- **Description:** Assignment creation, editing, and deletion by Class Reps. URL-based student submissions with deadline enforcement.
- **Enhancement (Aug 2026):** Added editing and deletion of assignments.

### 15. Student Issues & Representative Triage System (FR-8) ✅
- **Description:** Student issue reporting, privacy scopes, and representative triage/resolution workflows.

---

## Phase 6: Frontend Portals & Observability ✅ / 🔄

### 16. Next.js Representative & Administrator Dashboard UI (FR-11) ✅
- **Description:** Full responsive web dashboard for representatives and admins. Includes Group Management, Roster, Assignments, Announcements, Timetable, Issues, Notifications, Profile, and Admin panels.

### 17. Flutter Student Mobile Client Application (FR-11) ✅
- **Description:** Flutter mobile app exists for student group discovery, announcements, and timetable.
- **Enhancement (Aug 2026):** Full OTP verification screens added for registration and password resets, featuring a custom premium OTP input widget.

### 18. Observability, Audit Trail & Security Hardening (FR-12) 🔄
- **Description:** Rate limiting is active on auth endpoints. Structured logging and audit trail are partially implemented. Full observability metrics and security hardening review are ongoing.

---

## Technical Debt & Future Work

| Item | Notes |
| --- | --- |
| Update OpenAPI spec | New endpoints for OTP auth, assignment CRUD, placeholders, notification schema |
| Mobile OTP screens | ✅ Completed in Aug 2026. Custom widget built. |
| Custom email domain | Register SPF/DKIM/DMARC with Brevo for production deliverability |
| Archive legacy routes | `PasswordResetRequest` model and related routes are superseded by OTP flow |
| Rate limit review | Stricter limits on OTP endpoints to prevent abuse |
