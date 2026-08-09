# Security

Report security vulnerabilities by opening a private issue or contacting the maintainers directly. Do not include sensitive data in public issues.

For local security checks:
- Use `npm audit` to view known vulnerabilities.
- Run `npm audit fix` for safe fixes.
- For major updates that require breaking changes, create a separate branch and run `npm audit fix --force`, then run the test suite and perform manual QA.
