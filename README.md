# Talora — Class & Course-Unit Coordination Platform

[![CI Status](https://github.com/ledge-stack/talora-course-management/actions/workflows/ci.yml/badge.svg)](https://github.com/ledge-stack/talora-course-management/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Talora** is an API-first university class representative and group coordination platform. It replaces fragmented spreadsheets and chat threads with a governed, auditable workflow for student group allocation, announcements, timetable event distribution, assignment submission tracking, and student issue triage.

---

## 🏗️ Architecture & Monorepo Structure

Talora is designed as an **API-first modular monolith**. The repository is organized as a monorepo under `apps/` and `packages/`:

```
talora/
├── apps/
│   ├── web/          # Next.js UI & server-side API/BFF adapters (/api/v1)
│   └── mobile/       # Student-first Flutter mobile application
├── packages/
│   ├── domain/       # Business rules, identifier validators (YY007XXXXX), group constraints
│   ├── database/     # Prisma schema, PostgreSQL migrations, DB client
│   ├── contracts/    # OpenAPI 3.0 specification & TypeScript types
│   ├── auth/         # Role-based (RBAC) & Scope-based (institution/class/offering) policies
│   └── observability/# Structured logging, audit trail outbox, metrics
├── infrastructure/
│   └── deployment/   # Deployment specs & Helm charts
└── docs/             # Technical Architecture Document & PRD
```

---

## 🚀 Technology Stack

- **Web UI & API (BFF):** Next.js (App Router), React, TypeScript
- **Mobile Client:** Flutter (Dart) — Cross-platform Android & iOS app
- **System of Record:** PostgreSQL (relational constraints, transactional group memberships)
- **Email (SMTP):** Brevo SMTP relay (`smtp-relay.brevo.com`) for OTP delivery and notifications
- **Contracts:** OpenAPI 3.0

---

## 🔒 Core Business Rules

1. **Academic Scope:** All operational records belong to an Institution, Academic Term, Class/Cohort, and Course Offering.
2. **One Active Membership:** Enforced by DB constraint `@@unique([studentId, offeringId])` in `packages/database`.
3. **Group Size & Rules:** Minimum 5 members by default; maximum configurable per course offering (`max >= min`).
4. **Group Leadership:** Exactly one active leader per group; leadership transfers are atomic and audited.
5. **Identifier Validation:**
   - Student Number: `YY007XXXXX` (e.g., `2400712345`).
   - Registration Number: `YY/[Letter]/XXXXX` with optional `/EVE`, `/PS`, or `/PSA` suffix (e.g., `24/U/12345`, `24/I/12345/PS`, `24/X/12345/PSA`).
   - Matching leading `YY` verified across student and registration numbers.
6. **Spreadsheet Protection:** CSV/Excel formula injection escaping and preview validation.
7. **OTP Verification:** Account registration and password reset are guarded by a 6-digit time-limited OTP code delivered via Brevo SMTP. Codes expire after 15 minutes.
8. **Placeholder Reservations:** Group Leaders and Class Reps can reserve spots for students not yet registered on the platform using a student number as a placeholder.
9. **Notification Lifecycle:** Notifications are linked to their source records via `referenceId` and `referenceType`. When the source (e.g., an Announcement) is deleted, its notifications are atomically purged in a database transaction.

---

## 🚦 Quickstart (Local Development)

### 1. Prerequisites
- Node.js `>=20.0.0`
- npm `>=10.0.0`
- Flutter SDK (optional for mobile development)

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file from `.env.example` and add your PostgreSQL connection string (e.g. from Neon or Supabase) and Brevo SMTP credentials.

```env
DATABASE_URL=postgresql://...
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login@smtp-brevo.com
SMTP_PASS=your-brevo-smtp-key
EMAIL_FROM="Talora System <talora.system@yourdomain.com>"
JWT_SECRET=your-long-random-secret
```

### 4. Generate Prisma Client & Push Schema
```bash
npm run prisma:generate -w packages/database
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### 5. Start Development Servers
```bash
npm run dev
```
- Web UI & API: [http://localhost:3000](http://localhost:3000)
- API Health Check: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## 🧪 Testing & Linting

```bash
# Run tests across packages
npm test

# Run ESLint across monorepo
npm run lint

# Format code with Prettier
npm run format
```

---

## 📄 Documentation

- [System Architecture Document](docs/SYSTEM_ARCHITECTURE.md)
- [Product Requirements Document (PRD)](docs/PRODUCT_REQUIREMENTS.md)
- [Entity Relationship Diagram](docs/ERD.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [OpenAPI Specification](packages/contracts/openapi.yaml)
- [Infrastructure & Deployment Guide](infrastructure/deployment/README.md)

---

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and branch policies.

---

## 🛡️ Security

Security reports and guidelines are detailed in [SECURITY.md](SECURITY.md).

---

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
