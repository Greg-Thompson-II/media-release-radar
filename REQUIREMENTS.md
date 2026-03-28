# Real-Time Media Release Radar: Product Spec

## Core Objective

Build a background worker and API service that fetches weekly episodic media release schedules from the AniList GraphQL API and stores them securely in our PostgreSQL database.

## Phase 1: Data Ingestion (Current Focus)

1. **AniList GraphQL Integration:**
   - Create a dedicated service file in `backend/src/services/anilist.service.ts`.
   - Write a strictly typed HTTP POST request to `https://graphql.anilist.co` to fetch currently releasing media and their next airing episode.
   - Implement robust error handling and rate-limit respecting logic (AniList strictly limits to 90 requests/minute).

2. **Database Synchronization:**
   - Create a service that takes the AniList response and uses Prisma to `upsert` the `Media` titles and their corresponding `Episode` data into the database.
   - Ensure all `airDateUtc` values are mapped cleanly to standard UTC `DateTime` objects.

3. **Automation & API:**
   - Expose a manual trigger endpoint at `POST /api/sync/releases` inside `backend/src/server.ts` for immediate testing.
   - Set up a `node-cron` job that runs daily at 00:00 UTC to automatically trigger the sync service without manual intervention.
