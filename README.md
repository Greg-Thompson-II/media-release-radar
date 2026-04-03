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
* **Dynamic Show Details:** Dedicated Next.js dynamic routes (`/show/[id]`) provide in-depth media information, including dynamic genre tags, network details, and full synopses.
* **Advanced Client Filtering:** Users can instantly search titles via a real-time text input or toggle between all releasing media and their personal tracked watchlist without triggering additional network requests.
* **Graceful Edge Cases:** Polished, dark-mode native empty states handle zero-result search queries and unpopulated watchlists.
* **Dynamic SEO Metadata:** Integrates the Next.js Metadata API to generate unique browser tab titles and SEO context based on specific show data.
* **Watchlist State Hydration:** The frontend dynamically hydrates button states based on the user's database records, allowing seamless tracking and untracking.

## 🗺️ Roadmap & Upcoming Phases

**Phase 3: Real Authentication & Multi-Tenant Data**
* Implement secure user authentication (e.g., NextAuth/Auth.js or Clerk).
* Replace the mocked database user ID with actual session data, allowing multiple unique users to maintain private watchlists on the same deployment.

**Phase 4: The Personal Calendar View**
* Build a chronological "Upcoming Schedule" UI.
* Filter the release calendar to display *only* the specific shows a user has added to their watchlist, organized by localized release date.

**Phase 5: Notifications**
* Integrate push notifications or email alerts (via SendGrid/Resend) to notify users 1 hour before a tracked show airs.

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
