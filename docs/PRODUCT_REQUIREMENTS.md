# Talora — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Proposed MVP  
**Platforms:** Responsive Web Application (Next.js) and Mobile Application (Flutter)

---

## 1. Product Summary
Talora is a university class and course-unit coordination platform. It enables authorized class representatives to configure group rules, allocate students, publish structured announcements, manage group-change requests, collect assignment submissions, and resolve student issues.

Students can discover or create eligible groups, accept invitations, communicate within their groups, submit work, and track requests from one place.

---

## 2. Roles & Scopes

| Role | Scope | Key Capabilities |
| --- | --- | --- |
| **Platform Administrator** | Entire institution / platform | System configuration, privileged account management, audit inspection |
| **Class Representative** | Assigned class/cohort & term | Roster management, course offerings, timetable, rules, announcements, submissions, roster exports |
| **Group Leader** | One group within one offering | Invite eligible students, manage pending invitations, group messages, submission tracking |
| **Student** | Enrolled offerings | Profile, view/join/create groups, accept invitations, announcements, submit work, raise issues |

---

## 3. Core Business Rules
- **Academic Scope:** Every operational record belongs to an institution, academic term, class/cohort, and course-unit offering.
- **One Active Membership:** A student may belong to at most **one** active group per course-unit offering.
- **Group Size:** Configurable min and max membership (default min: 5, max >= min).
- **Leadership:** Exactly one active leader per group with atomic leadership transfer.
- **Identifier Validation:**
  - Student Number: `YY007XXXXX` (matches registrar rules & leading `YY`).
  - Registration Number: `YY/[Letter]/XXXXX` with optional `/EVE`, `/PS`, or `/PSA` suffix (e.g., `24/U/12345`, `24/I/12345/PS`, `24/X/12345/PSA`).
  - Leading `YY` must match across student number and registration number within an institution.
- **Strict Email Validation:**
  - Only Makerere student emails ending in `@students.mak.ac.ug` are permitted to register.
- **Self-Service Enrollment:** Students create their own accounts and manually enroll in the course units they intend to study.
