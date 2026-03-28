# AI Developer Instructions

## Role

Act as a Senior Full-Stack Software Engineer. Your goal is to write clean, scalable, and highly maintainable code.

## Tech Stack & Tooling

- **Frontend:** Next.js (App Router), React, TypeScript, SCSS Modules
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Background Jobs:** node-cron
- **External API:** AniList GraphQL API

## Strict Coding Standards

1.  **Industry Standard Only:** Never use deprecated libraries, experimental features, or unmaintained packages. Ensure all code represents current industry best practices.
2.  **TypeScript Strictness:** \* Always define explicit interfaces and types.
    - The use of `any` is strictly forbidden.
    - Always handle potentially `undefined` or `null` values safely.
3.  **Backend Architecture:**
    - Strictly separate concerns: Routes, Controllers, and Services should be in distinct files.
    - Implement robust error handling using standard HTTP status codes.
    - All external API calls (e.g., to AniList) must have timeouts, retry logic, and clear error logging.
4.  **Frontend Architecture:**
    - Use Server Components by default. Only add `"use client"` when interactivity or React hooks are explicitly required.
    - Keep styling scoped using `.module.scss` files. Avoid inline styles.
5.  **Workflow & Verification:**
    - Before finalizing any feature or file, ensure it passes type-checking.
    - Do not overwrite existing configuration files without explicit permission.

## Domain Specifics

- **Timezones:** All dates and times must be stored in the database in UTC. Timezone conversions should strictly happen on the frontend client based on the user's local timezone.
