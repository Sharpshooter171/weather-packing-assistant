# DevOps Guide — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial DevOps and workflow guide  
**Version:** 0.1

---

## 1. Purpose

This document defines the basic DevOps, repository, environment, and implementation workflow for Weather Packing Assistant.

The goal is to keep the project:

- Easy to run locally
- Safe with secrets
- Clear for code agents and human developers
- Stable for technical assessment review
- Organized around small, testable increments

This is not intended to be heavy enterprise DevOps. It is a pragmatic workflow for a small full-stack technical assessment project.

---

## 2. Repository

Repository:

```text
Sharpshooter171/weather-packing-assistant
```

Primary branch:

```text
main
```

Recommended development branch naming:

```text
docs/<topic>
feat/<feature-name>
fix/<bug-name>
chore/<task-name>
```

Examples:

```text
docs/api-contract
feat/backend-health-route
feat/weather-api-service
feat/deepseek-recommendation-service
fix/invalid-date-range-validation
chore/setup-ci
```

---

## 3. Development Principles

All implementation should follow these rules:

```text
1. Keep patches small.
2. Keep commits focused.
3. Do not commit secrets.
4. Do not change API contracts without updating docs/api-contract.md.
5. Do not change AI behavior without updating docs/ai-weather-interpretation-contract.md.
6. Do not change deterministic weather rules without updating docs/weather-rules.md.
7. Weather API data is the source of truth.
8. DeepSeek may interpret and explain, but backend validation is the final gate.
9. The app must work without DeepSeek using deterministic fallback rules.
10. The evaluator must be able to run the project locally.
```

---

## 4. Local Prerequisites

Required:

```text
Node.js 18+
npm 9+
Git
GitHub CLI optional but recommended
```

Recommended checks:

```bash
node --version
npm --version
git --version
gh --version
```

---

## 5. Initial Clone

```bash
git clone https://github.com/Sharpshooter171/weather-packing-assistant.git
cd weather-packing-assistant
```

Check repository status:

```bash
git status
git branch
```

Expected branch:

```text
main
```

---

## 6. Environment Variables

Local secrets must be stored in `.env` files and must never be committed.

The repository should include:

```text
.env.example
```

The repository should not include:

```text
.env
.env.local
*.db
*.sqlite
```

Initial `.env.example`:

```env
DATABASE_URL="file:./dev.db"

PORT=4000
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

WEATHER_API_BASE_URL="https://api.open-meteo.com"
GEOCODING_API_BASE_URL="https://geocoding-api.open-meteo.com"

DEEPSEEK_API_KEY=""
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_REASONING_EFFORT="medium"
AI_RECOMMENDATIONS_ENABLED="true"
```

Create local env:

```bash
cp .env.example .env
```

If `DEEPSEEK_API_KEY` is empty, the app must use deterministic fallback rules.

---

## 7. Package Manager Strategy

Default package manager:

```text
npm
```

The project may use npm workspaces.

Root `package.json` should define:

```json
{
  "private": true,
  "workspaces": [
    "apps/api",
    "apps/web",
    "packages/shared"
  ]
}
```

Avoid mixing package managers unless intentionally migrated.

Do not commit:

```text
node_modules/
```

Commit one lockfile:

```text
package-lock.json
```

---

## 8. Planned NPM Scripts

Root scripts should eventually include:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm --workspace apps/api run dev",
    "dev:web": "npm --workspace apps/web run dev",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:migrate": "npm --workspace apps/api run db:migrate",
    "db:studio": "npm --workspace apps/api run db:studio"
  }
}
```

Minimal first scripts are enough during scaffold:

```json
{
  "scripts": {
    "dev": "echo \"dev script not implemented yet\"",
    "build": "echo \"build script not implemented yet\"",
    "test": "echo \"test script not implemented yet\"",
    "lint": "echo \"lint script not implemented yet\""
  }
}
```

Replace placeholders as soon as apps are scaffolded.

---

## 9. Database Workflow

Database:

```text
SQLite + Prisma
```

Prisma schema path:

```text
prisma/schema.prisma
```

Common commands:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

Rules:

- Commit Prisma schema.
- Commit migration files when migrations are created.
- Do not commit local SQLite database files.
- Do not rely on manual database edits for demo behavior.

Suggested ignored files:

```text
*.db
*.db-journal
*.sqlite
*.sqlite3
```

---

## 10. Git Workflow

### Before Starting Work

```bash
git status
git pull origin main
```

### Create a Branch

```bash
git checkout -b feat/backend-health-route
```

### Commit Small Changes

```bash
git add .
git commit -m "feat: add backend health route"
```

### Push Branch

```bash
git push -u origin feat/backend-health-route
```

### Open PR

```bash
gh pr create --fill
```

For this small assessment project, direct commits to `main` are acceptable during documentation/scaffold phase, but feature work should preferably use branches once code implementation begins.

---

## 11. Commit Message Style

Use concise conventional-style commits.

Examples:

```text
docs: add API contract
chore: initialize npm workspaces
feat: add health endpoint
feat: add weather request repository
feat: add Open-Meteo service
feat: add DeepSeek recommendation service
fix: validate invalid date ranges
refactor: split weather normalization service
test: add weather rules unit tests
```

Recommended prefixes:

```text
docs
chore
feat
fix
refactor
test
style
ci
```

---

## 12. CI Strategy

Initial GitHub Actions workflow should run on pull requests and pushes to `main`.

Suggested file:

```text
.github/workflows/ci.yml
```

Initial CI checks:

```text
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

First workflow draft:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

During early scaffold, CI can be added after scripts are real to avoid expected failures.

---

## 13. Testing Strategy

Testing should focus on the highest-risk logic first.

Priority test areas:

```text
1. Date range validation
2. Location input validation
3. Weather rules classification
4. Packing checklist generation
5. DeepSeek output validation
6. Fallback behavior
7. CRUD repository behavior
8. API error normalization
9. Export CSV/JSON
```

Recommended test structure:

```text
apps/api/src/__tests__/
├── validators/
├── services/
├── routes/
└── repositories/
```

Frontend tests are optional for MVP but useful if time allows.

---

## 14. Manual Verification Checklist

Before demo or submission, run:

```bash
npm install
cp .env.example .env
npm run build
npm test
npm run dev
```

Then manually verify:

```text
- App loads locally
- User can search a location
- Current weather appears
- 5-day forecast appears
- Packing checklist appears
- Saved request appears in history
- User can update a request
- User can delete a request
- CSV export downloads
- JSON export returns data
- App still works without DEEPSEEK_API_KEY
```

---

## 15. Code Agent / OpenCode Rules

When using OpenCode or another coding agent, give it these rules:

```text
1. Read README.md first.
2. Read docs/product-requirements.md.
3. Read docs/architecture.md.
4. Read docs/api-contract.md before implementing routes.
5. Read docs/ai-weather-interpretation-contract.md before implementing DeepSeek.
6. Read docs/weather-rules.md before implementing classifier or packing rules.
7. Read docs/data-model.md before implementing Prisma.
8. Make one small patch at a time.
9. Do not invent new routes without updating docs/api-contract.md.
10. Do not commit secrets.
11. Keep the app runnable locally.
12. After each patch, run the smallest relevant test or command.
```

Suggested implementation order:

```text
Phase 1: package/workspace scaffold
Phase 2: backend health route
Phase 3: Prisma schema and repository
Phase 4: validators
Phase 5: weather rules engine
Phase 6: weather/geocoding API service
Phase 7: DeepSeek service and validator
Phase 8: CRUD routes
Phase 9: export routes
Phase 10: frontend scaffold
Phase 11: frontend weather UI
Phase 12: saved requests UI
Phase 13: final README/demo polish
```

---

## 16. Secrets Policy

Never commit:

```text
.env
.env.local
DEEPSEEK_API_KEY
API keys
Tokens
Credentials
Private logs
```

If a secret is accidentally committed:

```text
1. Rotate/revoke the key immediately.
2. Remove it from the repository.
3. Treat it as compromised.
```

Do not rely only on deleting a commit from history during assessment. Rotate the key.

---

## 17. Logging Policy

Allowed logs:

```text
- Request started
- Request completed
- Weather API failed
- AI recommendation failed
- Fallback used
- Validation failed
```

Disallowed logs:

```text
- API keys
- Authorization headers
- Raw secret values
- Full stack traces in public API response
```

Internal logs may be more detailed during local development, but user-facing responses must remain safe and normalized.

---

## 18. Deployment Strategy

Deployment is not required for the first implementation, but the project should be deployable.

Possible future deployment options:

```text
Frontend: Vercel
Backend: Render / Railway / Fly.io
Database: SQLite for local, PostgreSQL for deployed app
```

For assessment, local run plus demo video is enough if README instructions are clear.

---

## 19. Definition of Done

A feature is done when:

```text
- It follows the relevant docs contract.
- It has no committed secrets.
- It has basic validation.
- It has error handling.
- It has a small manual verification path.
- It does not break existing scripts.
- Documentation is updated if behavior changed.
```

For API features, also verify:

```text
- Success response shape matches docs/api-contract.md.
- Error response shape matches docs/api-contract.md.
- No stack traces are exposed.
```

For AI features, also verify:

```text
- DeepSeek is called only from backend.
- AI output is validated.
- Fallback works without DeepSeek.
```

---

## 20. Submission Readiness Checklist

Before submitting the project:

```text
- Public GitHub repository is accessible.
- README has setup instructions.
- .env.example is complete.
- App runs locally.
- Frontend requirement checklist is satisfied.
- Backend requirement checklist is satisfied.
- CRUD works.
- Export works.
- DeepSeek integration or documented fallback works.
- Demo video is recorded.
- Candidate name is visible.
- PM Accelerator information is included.
```

---

## 21. Final Rule

Keep the project simple, reproducible, and honest.

```text
A small working app with clear contracts is better than a complex app that cannot be run by the evaluator.
```
