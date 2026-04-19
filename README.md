# Real-Time Media Release Radar

A full-stack, multi-tenant web application that automatically tracks and displays upcoming TV show releases. Built with a decoupled architecture, featuring a self-healing background data-ingestion engine, secure JWT authentication, and a highly optimized Next.js frontend.

## 🚀 Current Status: Phase 4 Complete (Pre-Deployment)

- **Data Engine:** Automated hybrid synchronization (TMDB + TVMaze) for hyper-accurate, timezone-aware release timestamps.
- **Authentication:** Enterprise-grade user sessions via Clerk with secure Express middleware validation.
- **Frontend:** Server-Side Rendered (SSR) discovery dashboard and a personalized, localized chronological release calendar.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript, SCSS Modules, Clerk (@clerk/nextjs)
- **Backend:** Node.js, Express, TypeScript, node-cron, Clerk Express SDK (@clerk/express)
- **Database:** PostgreSQL (via Neon)
- **ORM:** Prisma 7 (@prisma/adapter-pg)
- **External APIs:** TMDB (The Movie Database), TVMaze

## ✨ Key Features

- **Multi-Tenant Architecture:** Secure user authentication using Clerk. The Next.js frontend securely transmits short-lived JWTs to the Express backend, ensuring complete data isolation for individual user watchlists.
- **Hybrid Data Ingestion Engine:** A background `node-cron` job automatically hydrates the database. It utilizes TMDB for robust media metadata and gracefully falls back to the TVMaze API to fetch exact, to-the-minute UTC release timestamps.
- **Self-Healing Database:** The data engine automatically prunes shows that are no longer airing, keeping the PostgreSQL database lean (averaging ~650 active records).
- **Personalized Agenda Calendar:** A custom UI timeline that aggregates a specific user's tracked shows, chronologically sorted and dynamically converted to their local timezone using the native `Intl.DateTimeFormat` API.
- **Optimized UI & Hydration:** Next.js Server Components fetch and render the discovery grid, while Client Components seamlessly hydrate interactive states (like the tracking buttons) based on the user's secure database records.
- **Advanced Client Filtering:** Users can search titles via a real-time text input or toggle between the global discovery feed and their private watchlist without triggering redundant network requests.
- **Dynamic SEO Metadata:** Integrates the Next.js Metadata API to generate unique browser tab titles and SEO context dynamically based on specific show parameters.

## 🗺️ Roadmap & Upcoming Phases

**Phase 5: Automated Notifications**

- Integrate push notifications or email alerts (via SendGrid/Resend) to notify users the exact minute a tracked show airs based on TVMaze timestamp data.

**Phase 6: Production Deployment**

- Deploy the Next.js frontend to Vercel.
- Deploy the Node.js/Express backend data engine to Render or Railway.
- Migrate from local development environment variables to production secrets.

## ⚙️ Local Development Setup

### 1. Environment Variables

You will need to configure `.env` files in both the frontend and backend directories.

**Backend (`backend/.env`):**

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host/db"
TMDB_API_TOKEN="your_tmdb_read_access_token"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

**Frontend (`frontend/.env.local`):**

```env
BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 2. Run the Application

Start the backend server and data engine:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Start the Next.js frontend:

```bash
cd frontend
npm install
npm run dev
```
