# Real-Time Media Release Radar

A full-stack web application that automatically tracks and displays upcoming TV show releases. Built with a decoupled architecture, featuring a background data-ingestion engine and a highly optimized Next.js frontend.

## 🚀 Current Status: Phase 2 Complete
- **Data Engine:** Automated backend synchronization with the TMDB API.
- **Frontend:** Server-Side Rendered (SSR) discovery dashboard with client-side watchlist hydration.

## 🛠 Tech Stack
* **Frontend:** Next.js 16 (App Router), React, TypeScript, SCSS Modules
* **Backend:** Node.js, Express, TypeScript, node-cron
* **Database:** PostgreSQL (via Neon)
* **ORM:** Prisma 7 (@prisma/adapter-pg)
* **External API:** TMDB (The Movie Database)

## ✨ Key Features
* **Automated Data Ingestion:** A `node-cron` job runs daily at 00:00 UTC, fetching currently airing TV shows from TMDB and upserting the data into a PostgreSQL database to prevent frontend rate-limiting.
* **Optimized UI:** Next.js Server Components fetch and render the discovery grid instantly, while Client Components handle interactive features (like tracking shows).
* **Timezone-Aware Calendar:** UTC air dates are dynamically converted to the user's localized timezone directly in the browser using the native `Intl` API.
* **Watchlist State Hydration:** The frontend dynamically hydrates button states based on the user's database records, allowing seamless tracking and untracking.
* **Sticky Client-Side Filtering:** Users can instantly toggle between all releasing media and their personal tracked watchlist without triggering additional network requests.

## ⚙️ Local Development Setup

### 1. Environment Variables
You will need to configure `.env` files in both the frontend and backend directories.

**Backend (`backend/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host/db"
TMDB_API_TOKEN="your_tmdb_read_access_token"
```

**Frontend (`frontend/.env.local`):**
```env
BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
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
