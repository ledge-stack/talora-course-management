# Talora — Entity Relationship Diagram (ERD)

This document maps out the core data model of the Talora platform as defined in the Prisma schema.

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
        String email UK
        String fullName
        String studentNumber UK
        String registrationNumber UK
        Boolean isActive
        Boolean isEmailVerified
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
        String leaderId
        String name
        GroupStatus status
    }

    GroupMembership {
        String id PK
        String groupId FK
        String studentId FK
        String offeringId FK
    }

    GroupChangeRequest {
        String id PK
        String groupId FK
        String studentId FK
        String status
    }

    Assignment {
        String id PK
        String offeringId FK
        String title
        DateTime dueDate
    }

    Submission {
        String id PK
        String assignmentId FK
        String studentId FK
        String fileUrl
    }
```

## Cascade Behaviors
- **CourseOffering Deletion:** Cascades down to wipe all associated `Group`, `Enrollment`, `Assignment`, `Announcement`, `TimetableEvent`, and `Issue` records.
- **Group Deletion:** Cascades down to wipe `GroupMembership` and `GroupChangeRequest` records.
- **User Deletion:** Cascades down to wipe `Enrollment`, `GroupMembership`, `UserRole`, `Submission`, `Issue`, and `Notification` records. Note: `AuditLog` records referencing a deleted user will have the `userId` set to `NULL` (SetNull) to preserve historical integrity.
