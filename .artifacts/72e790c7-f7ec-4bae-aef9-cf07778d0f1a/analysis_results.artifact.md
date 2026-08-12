# Talora System Audit & Documentation

This document provides a comprehensive audit and technical documentation of the **Talora Course Management System**.

## 1. System Overview

Talora is a full-stack university-focused platform designed to streamline course unit management, student group formation, and assignment submissions. It addresses common pain points in academic group work such as fair leader selection, group swapping, and centralized scheduling.

### Architecture
- **Monorepo Structure**: Contains both `client` (frontend) and `server` (backend).
- **Client**: Built with **Next.js 14 (App Router)**, providing a modern, responsive React-based interface.
- **Server**: A **Node.js/Express** REST API utilizing **TypeScript** for type safety and **Prisma ORM** for PostgreSQL database interactions.

---

## 2. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Next.js, Tailwind CSS, HeroUI (NextUI), Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens), Bcryptjs |
| **File Handling** | Multer, Cloudinary, Streamifier |
| **Security** | Helmet, Express Rate Limit, CORS |
| **Monitoring/Logging** | Sentry, Pino, Pino-HTTP |
| **Validation** | Zod |
| **Documentation** | Prisma Schema, KDoc-style comments |

---

## 3. Data Model Analysis

The database (PostgreSQL via Prisma) is structured around several core entities:

### Users & Roles
- **UserRole**: `student`, `group_leader`, `class_rep`.
- **User**: Stores profile info, credentials, and verification status.

### Group Formation Logic
- **CourseUnit**: Defines course-level rules (min/max size, gender restrictions, deadlines).
- **Group**: Linked to a `CourseUnit`. Has a `leaderId` (optional) and multiple `memberships`.
- **GroupMembership**: Join table between `User` and `Group`.
- **GroupApplication**: Allows students to apply to specific groups.
- **LeaderApplication**: Allows students to request leadership status (subject to Class Rep approval).

### Advanced Features
- **SwapRequest**: Handles the complex logic of students requesting group swaps within a course.
- **DefaultGroupTemplate**: Allows users to save a "preferred team" to quickly apply across multiple courses.
- **Submission**: Tracks file uploads for group assignments with versioning.
- **Complaint**: A formal channel for reporting issues (group conflicts, course errors).
- **TimetableSlot**: Maps courses to specific days, times, and venues.

---

## 4. Feature Audit

### Authentication & Authorization
- [x] Secure registration and login.
- [x] Email verification flow.
- [x] Role-based access control (RBAC) via middleware.

### Student Experience
- [x] **Dashboard**: Overview of active groups and pending assignments.
- [x] **Vacancy Finder**: Search for groups with available spots.
- [x] **Auto-Assignment**: "Random" assignment based on course rules (gender, capacity).
- [x] **Group Swapping**: Formalized request/approve flow for moving between groups.

### Leadership & Collaboration
- [x] **WhatsApp Integration**: Direct links for group communication.
- [x] **Application Management**: Leaders can accept/reject prospective members.
- [x] **Submissions**: Dedicated interface for group leaders to upload work.

### Administrative Control (Class Rep)
- [x] **Override Controls**: Manual relocation of students, group size overrides.
- [x] **Approval Workflows**: Reviewing leadership applications and complaints.
- [x] **Data Export**: Master CSV export for academic records.
- [x] **Course Management**: Setting deadlines and gender-restriction rules.

---

## 5. Audit Findings (Critical Observations)

### 🔴 Security & Code Quality Issues
> [!WARNING]
> **Compilation Bug in Group Routes**
> In `server/src/routes/groupRoutes.ts`, the functions `autoAssignStudent` and `applyForLeader` are invoked but **not imported** from the controller. This will cause a runtime/compilation error.

### 🟡 Performance Considerations
- **Prisma Transactions**: The system makes excellent use of `$transaction` for operations like group creation and auto-assignment, ensuring data integrity.
- **Rate Limiting**: Currently set to a high threshold (1000 requests / 15 mins), which is appropriate for development but should be tuned for production.

### 🟢 Strengths
- **Type Safety**: Thorough use of TypeScript across the stack.
- **UI/UX**: The dashboard uses `framer-motion` for smooth transitions and a cohesive design language (HeroUI).
- **Extensibility**: The schema is well-normalized, making it easy to add features like "Grading" or "Peer Review".

---

## 6. Recommended Next Steps

1. **Fix Routing Bug**: Correct the imports in `server/src/routes/groupRoutes.ts`.
2. **Expand Testing**: While Jest is configured, the `__tests__` directory should be populated with integration tests for the `SwapRequest` and `Auto-Assign` logic.
3. **API Documentation**: Consider integrating Swagger/OpenAPI for easier frontend-backend synchronization.
4. **Environment Safety**: Ensure `.env.example` is always kept in sync with the required variables (e.g., Cloudinary credentials).

---
**Audit Completed by Gemini (Senior Android Developer Persona)**
*Date: 2026-08-11*
