# Security Policy

## Reporting Vulnerabilities
Report security vulnerabilities by opening a private issue or contacting the project maintainers directly. Do not include sensitive data or exploitation steps in public issues.

## Security Practices
- **Authentication & Authorization:** Enforced on server via role-based and scope-based access controls (`packages/auth`).
- **Data Protection:** Database transactions maintain relational integrity; protected uploads use signed expiring URLs.
- **Spreadsheet Security:** Formula injection protection is enforced on all roster imports/exports.
- **Observability:** Sensitive credentials and tokens are redacted from structured logs.
