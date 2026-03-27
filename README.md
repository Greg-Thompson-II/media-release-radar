# Real-Time Media Release Radar

## Overview
A full-stack web application designed to track episodic media release schedules, manage user-specific watchlists, and provide timezone-accurate release notifications. 

## Architecture & Tech Stack
This project is built with a focus on strict typing, modularity, and scalable background processing.

**Frontend:**
* **Framework:** Next.js / React
* **Language:** TypeScript
* **Styling:** SCSS (Modular)

**Backend & Data (Upcoming):**
* **Runtime:** Node.js / Express
* **Database:** PostgreSQL (via Prisma ORM)
* **Background Processing:** node-cron for automated API polling
* **External API:** AniList GraphQL API

## Core Features
* **Automated Data Ingestion:** Background workers poll third-party GraphQL APIs to keep release schedules updated in real-time.
* **Timezone Synchronization:** Converts UTC air times to the user's localized timezone dynamically on the client.
* **User Watchlists:** Secure data models allowing users to track specific media and receive targeted updates.

## Local Development
*(Instructions for running the frontend and backend locally will be added as the environments are initialized.)*

1. Clone the repository
2. `npm install`
3. Set up `.env` variables (See `.env.example`)
4. `npm run dev`
