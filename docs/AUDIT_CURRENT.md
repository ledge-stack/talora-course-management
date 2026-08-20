# Talora Full System Audit
**Date:** August 21, 2026  
**Status:** In Progress (MVP Phase)

## 1. Executive Summary
This audit reflects the state of the Talora application following a major pass on security, enrollment flows, and email verification behavior. The platform is functionally stable for Student registration, Group formation, and Roster exports, but still lacks the global Admin controls to manage privileged roles.

## 2. Completed Milestones & Resolved Issues
- **Email Verification Removed:** Due to strict third-party spam filtering (specifically Google Workspace rejecting `smtp-brevo.com` generic sender domains), the email verification system has been completely ripped out. Users can now register and update their emails without being blocked by OTP requirements. 
- **Email Validation Relaxed:** The strict `@students.mak.ac.ug` domain check was removed to allow cross-institution or personal email usage during onboarding.
- **Account Deletion:** Users can successfully delete their accounts from the Profile panel. A `Cascade` delete handles all related records (enrollments, group memberships, submissions).
- **Group Name Permanence:** The ability to rename groups post-creation has been revoked to prevent student confusion and maintain consistency for class representatives.
- **Roster Export Sorting:** CSV exports of the class roster (`/api/v1/offerings/[id]/export`) are now reliably sorted by Group Name. The export logic dynamically joins `Enrollment` with `GroupMembership`.
- **Profile Lockdown:** Registration numbers and student numbers cannot be edited by the student once registered, preventing identity swapping.

## 3. Outstanding Work & Technical Debt
- **Admin User Management Panel:** A global platform admin dashboard is required to list users, assign `PLATFORM_ADMIN` or `CLASS_REPRESENTATIVE` roles dynamically, and monitor usage. Currently, roles must be manipulated via the database.
- **Ghost/Placeholder Reservations:** Group leaders need a way to reserve spots for students who haven't registered on the platform yet.
- **Unused Endpoints:** With email verification removed, `resend-verification/route.ts` and `verify/route.ts` are effectively orphaned and should be eventually pruned to reduce technical debt.
- **Brevo SMTP Authentication:** If email notifications are desired in the future (e.g. for announcements), the deployment must register a custom domain with verified SPF, DKIM, and DMARC records to bypass Google spam filters.

## 4. Security Posture
- Auth relies on stateless JWT stored in HTTP-only cookies.
- Middleware explicitly whitelists `/login`, `/register`, `/forgot-password`, and `/verify`.
- Prisma handles ORM injection protection safely.
