# Contributing to Talora

Thank you for contributing to Talora. Please follow these guidelines:

## Monorepo Workflow

The project uses npm workspaces structured into `apps/` and `packages/`:

- `apps/web`: Next.js web application & API adapters
- `apps/mobile`: Flutter mobile application
- `apps/worker`: Background worker engine
- `packages/*`: Shared domain, database, contracts, auth, and observability packages

## Branching & Pull Requests

1. Fork the repository and create a feature branch off `main`.
2. Ensure changes match the **System Architecture Document** (`docs/SYSTEM_ARCHITECTURE.md`) and **PRD** (`docs/PRODUCT_REQUIREMENTS.md`).
3. Run tests and linting before opening a PR:
   ```bash
   npm test
   npm run lint
   npm run format
   ```
4. Open a pull request targeting `main` with a description of the changes.
