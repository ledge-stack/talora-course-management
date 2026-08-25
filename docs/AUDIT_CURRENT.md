# Talora — Full System Audit

**Date:** August 26, 2026
**Version:** 2.0 (Post-OTP & Groups Overhaul)
**Status:** MVP Actively Deployed

---

## 1. Executive Summary

This audit reflects the current state of the Talora application as of August 2026. The platform has undergone a significant overhaul since the initial MVP, with the following key milestones completed:

- Full **Brevo SMTP integration** for email delivery is live and verified
- **6-digit OTP verification** has been implemented for both account registration and password resets, replacing the legacy manual Class Rep approval workflow
- The **Groups management dashboard** has been corrected to accurately count enrolled vs. grouped students (preventing negative "Ungrouped Students" values)
- **Notification lifecycle management** has been implemented: notifications are now linked to their source records and atomically purged when the source is deleted
- All **assignment management** (create, edit, delete) is operational for Class Reps
- **Admin user management** panel is operational for platform-level role management
- **Placeholder/ghost spot reservations** are live for Group Leaders and Class Reps

---

## 2. Completed Milestones

| Milestone | Details |
| --- | --- |
| **Brevo SMTP Integration** | Verified delivery via `smtp-relay.brevo.com:587`. Sender: `Talora System <talora.system@gmail.com>`. Custom sender domain recommended for production. |
| **Email OTP — Registration** | New accounts require a 6-digit OTP (15-min expiry) before gaining access. Stored as `verificationToken` on the `User` model. |
| **Email OTP — Password Reset** | Users trigger a password reset by entering their student number or email. An OTP is emailed and they are redirected to `/reset-password`. The legacy Class Rep manual approval flow is fully removed. |
| **Profile Editability** | Student Number and Registration Number are now editable by users from their profile page. |
| **Groups Stats Accuracy** | Ungrouped student count now filters `GroupMembership` strictly against enrolled students, preventing phantom negative values when group members exist outside the official enrollment list. |
| **Notification Reference Schema** | `Notification` model extended with `referenceId` and `referenceType` optional fields with a composite DB index. |
| **Announcement Notification Lifecycle** | Creating an announcement fans out notifications to all enrolled students. Deleting an announcement atomically purges all linked notifications. |
| **Assignment Management** | Class Reps can create, edit, and delete assignments. Editing and deletion were added in the August 2026 pass. |
| **Placeholder Reservations** | Group Leaders and Class Reps can reserve spots for unregistered students by student number via `GroupPlaceholder` model. |
| **Admin User Management Panel** | Platform Admins can list users and assign/revoke roles via the `/admin/users` dashboard. |
| **Assign Ungrouped Modal** | Updated to display student numbers instead of emails for easier identification during manual assignment. |
| **Group Ordering** | Groups on the Groups page are organized in ascending alphabetical order. |
| **CSV Export Sorting** | Roster exports are sorted by Group Name for easier reading. |
| **Account Deletion** | Users can permanently delete their accounts; cascade deletes handle all related data. |

---

## 3. Outstanding Work & Technical Debt

| Item | Priority | Notes |
| --- | --- | --- |
| **Orphan Routes** | Low | `resend-verification/route.ts` now uses the OTP flow but could be consolidated. `password-resets/` page and API (`/api/v1/password-resets`) reference the legacy `PasswordResetRequest` model which is no longer used by the active reset flow. Consider archiving or removing. |
| **Custom Email Domain** | Medium | For production, register a custom domain with SPF, DKIM, and DMARC records on Brevo to improve deliverability and avoid Google spam filtering. |
| **Mobile App OTP Screens** | High | The Flutter mobile app does not yet have OTP verification screens for registration and password reset to match the web experience. |
| **OpenAPI Specification** | Medium | The `packages/contracts/openapi.yaml` spec has not been updated to reflect new endpoints (assignment management, OTP auth, placeholders, notifications with referenceId). |
| **Rate Limiting Review** | Medium | OTP email endpoints (`/forgot-password`, `/resend-verification`) should have stricter rate limits to prevent abuse. |
| **ERD Update** | Low | `ERD.md` is missing `GroupPlaceholder` and the new `Notification` fields in its entity definitions. |

---

## 4. Security Posture

- Auth relies on stateless JWT stored in HTTP-only cookies.
- Middleware explicitly whitelists `/login`, `/register`, `/forgot-password`, `/verify`, `/reset-password`.
- All sensitive auth endpoints require OTP verification before granting access or performing sensitive operations.
- Prisma handles ORM injection protection safely.
- Rate limiting is applied to auth endpoints via `@/lib/rateLimit`.
- CSV/Excel formula injection is escaped in all export routes.

---

## 5. Database Health

| Check | Status |
| --- | --- |
| Schema in sync with codebase | ✅ Yes — `npx prisma db push` confirmed |
| All unique constraints in place | ✅ `(studentId, offeringId)` on `GroupMembership` and `Enrollment` |
| Cascade behaviors correct | ✅ Verified on `User`, `CourseOffering`, `Group`, `Announcement` |
| OTP token fields present on `User` | ✅ `verificationToken`, `verificationTokenExpires`, `resetToken`, `resetTokenExpires` |
| Notification `referenceId`/`referenceType` fields | ✅ Present with composite index |
