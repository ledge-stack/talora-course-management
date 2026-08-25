# Talora — Entity Relationship Diagram (ERD)

**Last Updated:** August 2026

This document maps out the core data model of the Talora platform as defined in the Prisma schema (`packages/database/prisma/schema.prisma`).

## Core Schema (Mermaid)

```mermaid
erDiagram
    %% Core Academic Hierarchy
    Institution ||--o{ AcademicTerm : "terms"
    Institution ||--o{ User : "users"
    
    AcademicTerm ||--o{ CourseOffering : "offerings"
    CourseUnit ||--o{ CourseOffering : "offerings"
    ClassCohort ||--o{ CourseOffering : "offerings"
    ClassCohort ||--o{ UserRole : "roles"

    %% Users and Access
    User ||--o{ UserRole : "roles"
    User ||--o{ Enrollment : "enrollments"
    User ||--o{ GroupMembership : "memberships"
    User ||--o{ Submission : "submissions"
    User ||--o{ Issue : "issues"
    User ||--o{ Notification : "notifications"
    User ||--o{ AuditLog : "auditLogs"
    User ||--o{ Announcement : "authoredAnnouncements"
    User ||--o{ PasswordResetRequest : "passwordResets"

    %% Course Offering Aggregates
    CourseOffering ||--o{ Enrollment : "enrollments"
    CourseOffering ||--o{ Group : "groups"
    CourseOffering ||--o{ Announcement : "announcements"
    CourseOffering ||--o{ Assignment : "assignments"
    CourseOffering ||--o{ TimetableEvent : "events"
    CourseOffering ||--o{ Issue : "issues"

    %% Group Dynamics
    Group ||--o{ GroupMembership : "memberships"
    Group ||--o{ GroupChangeRequest : "changeRequests"
    Group ||--o{ GroupPlaceholder : "placeholders"
    
    %% Assignment Submissions
    Assignment ||--o{ Submission : "submissions"

    %% Entities
    Institution {
        String id PK
        String name
        String code UK
    }

    AcademicTerm {
        String id PK
        String institutionId FK
        String name
        Boolean isCurrent
    }

    CourseUnit {
        String id PK
        String code UK
        String title
        String lecturerName
        String lecturerEmail
        String lecturerPhone
    }

    ClassCohort {
        String id PK
        String name
        Int year
    }

    CourseOffering {
        String id PK
        String unitId FK
        String termId FK
        String classId FK
        Int minGroupSize
        Int maxGroupSize
    }

    User {
        String id PK
        String institutionId FK
        String email UK
        String passwordHash
        String fullName
        String studentNumber UK
        String registrationNumber UK
        Boolean isActive
        Boolean isEmailVerified
        String verificationToken
        DateTime verificationTokenExpires
        String resetToken
        DateTime resetTokenExpires
        Boolean tookGapYear
    }

    UserRole {
        String id PK
        String userId FK
        String classId FK
        RoleType role
    }

    Enrollment {
        String id PK
        String studentId FK
        String offeringId FK
    }

    Group {
        String id PK
        String offeringId FK
        String leaderId FK
        String name
        GroupStatus status
        Boolean isOpen
        Boolean isLocked
    }

    GroupMembership {
        String id PK
        String groupId FK
        String studentId FK
        String offeringId FK
    }

    GroupPlaceholder {
        String id PK
        String groupId FK
        String studentNumber
    }

    GroupChangeRequest {
        String id PK
        String groupId FK
        String studentId FK
        String targetGroupId
        String status
        String reason
    }

    Assignment {
        String id PK
        String offeringId FK
        String title
        String description
        DateTime dueDate
        String type
    }

    Submission {
        String id PK
        String assignmentId FK
        String studentId FK
        String fileUrl
    }

    Announcement {
        String id PK
        String offeringId FK
        String authorId FK
        String title
        String content
        String tag
    }

    Notification {
        String id PK
        String userId FK
        String title
        String message
        String referenceId
        String referenceType
        Boolean isRead
    }

    TimetableEvent {
        String id PK
        String offeringId FK
        String title
        Int dayOfWeek
        String startTime
        String endTime
        String location
    }

    Issue {
        String id PK
        String studentId FK
        String offeringId FK
        String category
        String title
        String description
        IssueStatus status
    }

    AuditLog {
        String id PK
        String userId FK
        String action
        String details
    }

    PasswordResetRequest {
        String id PK
        String studentId FK
        String status
        DateTime processedAt
        String processedById
    }
```

## Cascade Behaviors

- **CourseOffering Deletion:** Cascades to wipe all associated `Group`, `Enrollment`, `Assignment`, `Announcement`, `TimetableEvent`, and `Issue` records.
- **Group Deletion:** Cascades to wipe `GroupMembership`, `GroupChangeRequest`, and `GroupPlaceholder` records.
- **User Deletion:** Cascades to wipe `Enrollment`, `GroupMembership`, `UserRole`, `Submission`, `Issue`, and `Notification` records. `AuditLog` records referencing a deleted user have `userId` set to `NULL` (SetNull) to preserve historical integrity.
- **Announcement Deletion:** Atomically deletes all linked `Notification` records (filtered by `referenceId` = announcement ID and `referenceType` = `"ANNOUNCEMENT"`) in a single database transaction.

## Unique Constraints

| Model | Constraint | Purpose |
| --- | --- | --- |
| `Enrollment` | `(studentId, offeringId)` | One enrollment per student per offering |
| `GroupMembership` | `(studentId, offeringId)` | One group per student per offering |
| `User` | `email` | Unique accounts by email |
| `User` | `studentNumber` | Unique student identity |
| `User` | `registrationNumber` | Unique registration identity |
| `CourseUnit` | `code` | Unique course code |
| `Institution` | `code` | Unique institution code |
