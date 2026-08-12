# Talora — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Proposed MVP  
**Platforms:** Responsive Web Application (Next.js) and Mobile Application (Flutter)

---

## 1. Product Summary
Talora is a university class and course-unit coordination platform. It enables authorized class representatives to import student and course data, configure group rules, allocate students, publish structured announcements, manage group-change requests, collect assignment submissions, and resolve student issues.

Students can discover or create eligible groups, accept invitations, communicate within their groups, submit work, and track requests from one place.

---

## 2. Roles & Scopes

| Role | Scope | Key Capabilities |
| --- | --- | --- |
| **Platform Administrator** | Entire institution / platform | System configuration, privileged account management, audit inspection |
| **Class Representative** | Assigned class/cohort & term | Roster management, course offerings, timetable, rules, announcements, submissions, imports/exports |
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
  - Registration Number: `YY/U/XXXXX`, `YY/U/XXXXX/EVE`, or `YY/U/XXXXX/PS`.
  - Leading `YY` must match across student number and registration number within an institution.
- **Spreadsheet Protection:** CSV/Excel formula injection prevention, row-level validation preview before import commit.
