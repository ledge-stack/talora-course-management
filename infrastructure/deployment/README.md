# Deployment Architecture & Guidance

As specified in Section 12 of the System Architecture Document, deployment is split into stateless application containers and managed data infrastructure.

## Component Deployment Overview

| Component | Target Runtime | Deployment Guidance |
| --- | --- | --- |
| **Next.js Web / API** | Containerized Web Service | Stateless container behind HTTPS load balancer / CDN. |
| **Worker** | Background Worker Process | Dedicated worker instance executing async import/export, notifications, and file scanning. |
| **PostgreSQL** | Managed Relational Database | Relational database system of record with automated backups, point-in-time recovery, and private networking. |
| **Redis** | Managed In-Memory Cache | ephemereal locks, rate limiting, and job queues. |
| **Object Storage** | S3-Compatible Bucket | Encrypted storage bucket with lifecycle rules and signed expiration URLs. |
| **Flutter Mobile Client** | Android / iOS Apps | Native binaries configured with environment-specific API base URL. |
