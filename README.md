# Finance-OS

A production-oriented financial management platform built as a monorepo.

## Tech Stack

* **Frontend:** React + Vite
* **Routing:** TanStack Router
* **Styling:** Tailwind CSS
* **UI:** shadcn/ui
* **Backend:** Node.js + Express
* **Database:** MongoDB
* **Language:** TypeScript
* **Package Manager:** pnpm
* **Documentation:** Astro + Starlight
* **Validation:** Zod
* **Authentication:** JWT
* **Logging:** Pino

---

## Prerequisites

Make sure the following are installed before setting up the project:

* Node.js
* pnpm
* Git
* MongoDB

Check your installed versions:

```bash
node --version
pnpm --version
git --version
```

Recommended versions for this project should be documented in the repository's `package.json` / `packageManager` configuration.

---

# Getting Started

## 1. Clone the Repository

Clone the repository from GitHub:

```bash
git clone <REPOSITORY_URL>
```

Move into the project directory:

```bash
cd finance-os
```

Verify the repository:

```bash
git status
```

You should see the current branch and working tree status.

---

## 2. Switch to the Development Branch

If development is done on the `develop` branch:

```bash
git checkout develop
```

Or with modern Git:

```bash
git switch develop
```

Pull the latest changes:

```bash
git pull origin develop
```

---

## 3. Install Dependencies

Finance-OS uses **pnpm workspaces**.

Install all dependencies from the repository root:

```bash
pnpm install
```

Do **not** install dependencies separately inside individual applications unless specifically required.

The workspace root manages dependencies across:

```text
apps/
packages/
docs/
```

---

# Project Structure

The repository follows a monorepo structure:

```text
finance-os/
├── apps/
│   ├── web/              # Frontend application
│   └── backend/          # Backend API
│
├── packages/
│   ├── ui/               # Shared shadcn/ui components
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configuration
│   └── utils/            # Shared utilities
│
├── docs/                 # Project documentation
│
├── .github/              # GitHub workflows and configuration
├── package.json          # Root workspace configuration
├── pnpm-workspace.yaml   # pnpm workspace definition
├── pnpm-lock.yaml        # Dependency lockfile
└── README.md
```

---

# Environment Configuration

Environment variables should **never be committed** to Git.

Create the required environment files based on the project's environment templates.

For example:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Then configure the required values:

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/finance-os
JWT_SECRET=your-development-secret
```

If the frontend requires environment variables, create its environment file as well.

Example:

```bash
cp apps/web/.env.example apps/web/.env
```

> Never commit `.env` files containing secrets.

---

# Running the Project

## Start Development Environment

From the repository root:

```bash
pnpm dev
```

This should start the required workspace applications in development mode.

Depending on the current workspace configuration, the applications may run on separate ports.

Typical development URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Docs:     http://localhost:4321
```

The exact ports should be taken from the current application configuration.

---

# Code Quality Checks

Before creating a pull request or pushing significant changes, run the project's validation commands.

## 1. Typecheck

Run TypeScript checks across the workspace:

```bash
pnpm typecheck
```

The command should complete without TypeScript errors.

A successful result means the project passes static type checking.

---

## 2. Lint

Run ESLint across the workspace:

```bash
pnpm lint
```

Fix all reported linting errors before pushing changes.

If the project provides an automatic lint-fix command:

```bash
pnpm lint:fix
```

Use it where appropriate, then review the changes before committing.

---

## 3. Build

Run the production build:

```bash
pnpm build
```

The build should complete successfully without compilation or bundling errors.

A successful build verifies that the applications and packages can be compiled for production.

---

# Recommended Validation Order

Before pushing code, run the checks in this order:

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
```

If all four commands succeed, the current workspace passes the primary local validation checks.

---

# Development Workflow

Use the following workflow when working on a feature or bug fix.

## 1. Update Your Branch

```bash
git switch develop
git pull origin develop
```

## 2. Create a Feature Branch

Use descriptive branch names:

```bash
git switch -c feature/<feature-name>
```

Examples:

```bash
git switch -c feature/account-management
git switch -c feature/transaction-filters
git switch -c fix/dashboard-responsive-layout
```

---

## 3. Make Your Changes

Develop the feature while following the existing project architecture and conventions.

Keep changes focused and avoid unrelated modifications.

---

## 4. Run Validation

Before committing:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Fix any errors before continuing.

---

## 5. Review Git Changes

Check modified files:

```bash
git status
```

Review the actual changes:

```bash
git diff
```

---

## 6. Commit Changes

Create a meaningful commit:

```bash
git add .
git commit -m "feat: add account management"
```

Follow the project's commit convention consistently.

Examples:

```text
feat: add transaction filtering
fix: resolve dashboard responsive issue
refactor: simplify transaction service
docs: update project setup guide
chore: update dependencies
```

---

## 7. Push the Branch

```bash
git push -u origin feature/<feature-name>
```

Then create a Pull Request targeting:

```text
develop
```

---

# Pull Request Checklist

Before opening a Pull Request, verify:

* [ ] Code follows the existing project structure
* [ ] TypeScript errors are resolved
* [ ] Lint errors are resolved
* [ ] Production build succeeds
* [ ] No `.env` or secret files are committed
* [ ] No unnecessary dependencies were added
* [ ] Git diff has been reviewed
* [ ] Commit messages are meaningful
* [ ] Documentation has been updated when required

Run:

```bash
pnpm typecheck
pnpm lint
pnpm build
git status
git diff
```

---

# Troubleshooting

## Dependencies Are Out of Sync

Try:

```bash
pnpm install
```

If the lockfile is intentionally being regenerated:

```bash
pnpm install --lockfile-only
```

Do not delete the lockfile unless there is a deliberate reason to regenerate dependency resolution.

---

## TypeScript Errors

Run:

```bash
pnpm typecheck
```

Then inspect the reported file and line number.

Avoid using `any` as a quick workaround. Prefer correcting the underlying type definition.

---

## Build Errors

Run:

```bash
pnpm build
```

For workspace-specific debugging, run the build command inside the affected package:

```bash
cd apps/web
pnpm build
```

or:

```bash
cd apps/backend
pnpm build
```

---

## Lint Errors

Run:

```bash
pnpm lint
```

If supported:

```bash
pnpm lint:fix
```

Always review automatically fixed files afterward.

---

## Port Already in Use

If a development server reports that a port is already in use, identify and stop the process occupying the port, or configure the application to use another development port.

---

# Production Verification

Before considering a feature complete, the following should pass from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected result:

```text
Typecheck  → PASS
Lint       → PASS
Build      → PASS
```

Only code that passes these checks should normally be considered ready for review.

---

# Quick Setup

For experienced contributors, the basic setup is:

```bash
git clone <REPOSITORY_URL>
cd finance-os

git switch develop
git pull origin develop

pnpm install

# Configure environment variables

pnpm dev
```

Before pushing:

```bash
pnpm typecheck
pnpm lint
pnpm build

git status
git diff
```

---

# Documentation

Project documentation is maintained separately under:

```text
docs/
```

The documentation site can be started using the project's configured documentation command.

For documentation-specific development, refer to the `docs/` project configuration and its README.

---

# Contribution Guidelines

Keep contributions:

* Small and focused
* Type-safe
* Consistent with existing architecture
* Properly tested
* Documented where necessary
* Free of secrets and unnecessary dependencies

Prefer improving the existing architecture over introducing a new pattern for a single feature.

---

# License

This project is currently maintained as a development/academic project.

Add the project's final license information here when the licensing decision has been finalized.
