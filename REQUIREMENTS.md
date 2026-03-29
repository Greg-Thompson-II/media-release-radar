# Real-Time Media Release Radar: Product Spec

## Core Objective

Build a background worker and API service that fetches weekly episodic media release schedules from the AniList GraphQL API and stores them securely in our PostgreSQL database.

## Phase 2: Frontend Discovery & Watchlist (Current Focus)

### 1. The Discovery Dashboard (`frontend/src/app/page.tsx`)

- **Architecture:** Use Next.js Server Components to fetch the list of `RELEASING` media directly from our Express backend (`GET /api/media`).
- **UI/UX:** Build a responsive CSS Grid displaying media cards. Each card must show the `coverImage`, `title`, and the episode number of the `nextAiringEpisode`.
- **Interactivity:** Add a "Track Show" button to each card. This button must be a Client Component (`"use client"`) that sends a POST request to the backend to add the show to the user's watchlist.

### 2. Timezone-Aware Calendar (`frontend/src/components/Calendar.tsx`)

- **Architecture:** A Client Component that receives the UTC `airDateUtc` from the database.
- **Logic:** Use the native browser `Intl.DateTimeFormat` API to dynamically convert the UTC timestamp into the user's localized timezone and format (e.g., converting "2026-03-29T14:00:00Z" to "Sunday, 9:00 AM").

### 3. Backend Support (New Routes Needed)

- Create a `GET /api/media` route in the Express backend to serve the currently airing shows to the frontend.
- Create a `POST /api/watchlist` route to handle adding a specific `mediaId` to the `TrackedMedia` table for a mocked user.
