# Real-Time Media Release Radar

A high-performance, full-stack web application designed to track and display upcoming international TV show releases. This project utilizes a decoupled monorepo architecture, featuring a self-healing background data-ingestion engine, secure JWT authentication, and a production-optimized Next.js frontend.

## 🔗 Live Links

- **Frontend (Vercel):** [Insert your Vercel URL here]
- **Backend (Railway):** [Insert your Railway Domain URL here]

## 🚀 Deployment Status: Phase 5 Complete (Production Live)

- **Cloud Infrastructure:** Successfully migrated from local development to a distributed production environment using Vercel (Edge) and Railway.
- **Networking:** Optimized port routing (8080) for high-concurrency API requests and cross-origin security.
- **Data Engine:** Automated hybrid synchronization (TMDB + TVMaze) for hyper-accurate, timezone-aware release timestamps.
- **Authentication:** Enterprise-grade user sessions via Clerk with cross-domain Express middleware validation.

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React, TypeScript, SCSS Modules, Clerk |
| **Backend** | Node.js, Express, TypeScript, `node-cron`, Clerk Express SDK |
| **Database** | PostgreSQL (via Neon) |
| **ORM** | Prisma 7 |
| **External APIs** | TMDB (The Movie Database), TVMaze |

## ✨ Key Features

- **Intelligent Filtering Purge:** The ingestion engine maintains high data quality by targeting international shows with significant viewership and ratings. To keep the UI noise-free and the database lean, the engine automatically filters out low-rated content and entries with fewer than two released episodes.
- **Decoupled Architecture:** Built as a monorepo with strict separation of concerns. The Next.js frontend communicates with the Express API via secure, short-lived JWTs, ensuring complete data isolation and a modular developer experience.
- **Self-Healing Data Engine:** A background `node-cron` job manages database hygiene. It utilizes TMDB for robust metadata and falls back to TVMaze for to-the-minute UTC release timestamps, while automatically pruning inactive or canceled shows.
- **Personalized Chronological Agenda:** A custom UI timeline aggregates a user's tracked shows, chronologically sorted and dynamically converted to their local timezone using the native `Intl.DateTimeFormat` API.
- **SSR & Hydration Strategy:** Utilizes Next.js Server Components for the initial discovery grid render to maximize SEO and performance, while Client Components handle real-time tracking states and interactive filtering.

## 🗺️ Roadmap

**Phase 6: Automated Notifications**
- Integrate push notifications or email alerts (via SendGrid/Resend) to notify users the moment a tracked show airs based on TVMaze timestamp data.

**Phase 7: Custom Notification Logic**
- Implement user-facing settings to adjust notification lead times (e.g., 30 minutes before, exactly at air time, or a daily morning digest).

**Phase 8: Direct Streaming Integration**
- Aggregate and display live deep-links to official streaming services (Netflix, Crunchyroll, HBO Max, etc.) within notifications and the UI, allowing users to jump directly to the content upon release.

**Phase 9: Advanced Analytics**
- Implement dashboard metrics for user tracking trends and "Most Anticipated" global releases.

## ⚙️ Local Development Setup

To run this project locally, ensure you have the following variables configured in your respective `.env` files.

### 1. Backend (`backend/.env`)

```env
PORT=8080
DATABASE_URL="postgresql://user:password@host/db"
TMDB_API_TOKEN="your_tmdb_read_access_token"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 2. Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 3. Execution

Start the backend server and data engine:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Start the Next.js frontend:

```bash
cd frontend
npm install
npm run dev
```
