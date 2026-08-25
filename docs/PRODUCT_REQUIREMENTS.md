# Talora — Product Requirements Document (PRD)

**Version:** 1.1
**Last Updated:** August 2026
**Status:** MVP — Actively Deployed
**Platforms:** Responsive Web Application (Next.js) and Mobile Application (Flutter)

---

## 1. Product Summary

Talora is a university class and course-unit coordination platform. It enables authorized class representatives to configure group rules, allocate students, publish structured announcements, manage group-change requests, collect assignment submissions (via URL links like Google Drive or GitHub), and resolve student issues.

Students can discover or create eligible groups, join groups, submit assignment links, and track requests from one place. Account creation and password resets are secured via email OTP verification.

---

## 2. Roles & Scopes

| Role | Scope | Key Capabilities |
| --- | --- | --- |
| **Platform Administrator** | Entire institution / platform | System configuration, privileged account management, audit inspection, role assignment |
| **Class Representative** | Assigned class/cohort & term | Roster management, course offerings, timetable, group rules, announcements, submissions, roster exports, bulk auto-assign ungrouped students, forced member assignment |
| **Group Leader** | One group within one offering | Add/remove members, reserve placeholder spots for unregistered students, transfer leadership, toggle group open/invite-only |
| **Student** | Enrolled offerings | Profile management, view/join/create groups, apply to join groups, submit work, raise issues, view announcements, view timetable |

---

## 3. Core Business Rules

- **Academic Scope:** Every operational record belongs to an institution, academic term, class/cohort, and course-unit offering.
- **One Active Membership:** A student may belong to at most **one** active group per course-unit offering. Enforced by DB unique constraint.
- **Group Size:** Configurable min and max membership per Course Offering (default min: 5, max: 10).
- **Leadership:** Exactly one active leader per group with atomic leadership transfer.
- **Group Permanence:** Once a group is created, its name cannot be edited by students or leaders. Class Reps may still rename groups.
- **Identifier Validation:**
  - Student Number: `YY007XXXXX` (matches registrar rules & leading `YY`).
  - Registration Number: `YY/[Letter]/XXXXX` with optional `/EVE`, `/PS`, or `/PSA` suffix (e.g., `24/U/12345`, `24/I/12345/PS`, `24/X/12345/PSA`).
  - Leading `YY` must match across student number and registration number within an institution.
- **Profile Editability:** Users can edit their Student Number and Registration Number from their profile page after registration. This is intentional to accommodate late roster corrections.
- **Email Validation & Verification:**
  - Any valid email address is permitted to register.
  - Email OTP verification is **required** during account registration. A 6-digit code is sent via Brevo SMTP and expires in 15 minutes.
  - Email OTP verification is also **required** for password resets. The Class Representative manual approval flow has been replaced entirely.
- **Self-Service Enrollment & Rosters:** Students create their own accounts and manually enroll in the course units they intend to study. Class rosters are dynamically built combining `Enrollment` and `GroupMembership` records and are automatically sorted by Group Name during export.
- **Account Deletion:** Users can permanently delete their accounts and all associated data at any time. Cascade deletes handle all related records.
- **Assignment Submissions:** Submissions are URL-based (e.g., Google Drive, Figma, GitHub links). There are no direct file uploads.
- **Placeholder Reservations:** Group Leaders and Class Reps can reserve spots in a group using a student number to hold a place for students not yet registered on the platform (`GroupPlaceholder` model).
- **Notification Lifecycle:** Notifications are created automatically when announcements are published. When an announcement is deleted, its associated notifications are atomically deleted in the same database transaction.

---

## 4. Feature List (Current State)

| Feature | Status | Notes |
| --- | --- | --- |
| User registration with OTP verification | ✅ Live | 6-digit email OTP via Brevo |
| Password reset with OTP | ✅ Live | Replaces manual rep-approval flow |
| Profile management (edit identifiers) | ✅ Live | Student/Reg numbers editable |
| Course offering enrollment | ✅ Live | Self-service |
| Group creation & join | ✅ Live | Open & invite-only modes |
| Group leader management (add/remove members) | ✅ Live | |
| Placeholder/ghost spot reservations | ✅ Live | By student number |
| Group change requests | ✅ Live | Student → Leader/Rep approval |
| Bulk auto-assign ungrouped students | ✅ Live | Rep only |
| Force-assign student to group | ✅ Live | Rep only |
| Announcements (create/edit/delete) | ✅ Live | With notification fan-out |
| Notification auto-delete on announcement delete | ✅ Live | Atomic DB transaction |
| Assignment creation (HOMEWORK, PROJECT, QUIZ, EXAM) | ✅ Live | Rep only |
| Assignment editing & deletion | ✅ Live | Rep only |
| Assignment submission (URL-based) | ✅ Live | Students |
| Issues reporting & triage | ✅ Live | |
| Timetable events | ✅ Live | |
| Class roster export (Excel) | ✅ Live | Sorted by Group Name |
| Excel/CSV roster import | ✅ Live | With preview & formula injection protection |
| Platform admin user management | ✅ Live | Role assignment via admin panel |
| In-app notifications | ✅ Live | Referenced to source records |
| Groups stats (correct count of grouped/ungrouped) | ✅ Live | Filters only enrolled students |
