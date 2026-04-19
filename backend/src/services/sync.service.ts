import { prisma } from "../lib/prisma.js";
import {
  fetchOnAirShows,
  buildCoverImageUrl,
  buildLogoUrl,
} from "./tmdb.service.js";
import { getExactAirTime } from "./tvmaze.service.js";

const TVMAZE_DELAY_MS = 600;

export interface SyncResult {
  upserted: number;
  errors: number;
}

export async function runSync(): Promise<SyncResult> {
  console.log("Sync started.");
  const shows = await fetchOnAirShows();

  let upserted = 0;
  let errors = 0;
  const syncedTmdbIds: number[] = [];

  for (const show of shows) {
    try {
      const primaryNetwork = show.networks[0] ?? null;
      const networkName = primaryNetwork?.name ?? null;
      const networkLogoUrl = buildLogoUrl(primaryNetwork?.logo_path ?? null);

      const media = await prisma.media.upsert({
        where: { tmdbId: show.id },
        update: {
          title: show.name,
          coverImage: buildCoverImageUrl(show.poster_path),
          network: networkName,
          networkLogoUrl,
          status: "RELEASING",
        },
        create: {
          tmdbId: show.id,
          title: show.name,
          coverImage: buildCoverImageUrl(show.poster_path),
          network: networkName,
          networkLogoUrl,
          status: "RELEASING",
        },
      });

      syncedTmdbIds.push(show.id);

      if (show.next_episode_to_air !== null) {
        const { episode_number, air_date } = show.next_episode_to_air;

        const airstamp = await getExactAirTime(show.name);
        await new Promise((resolve) => setTimeout(resolve, TVMAZE_DELAY_MS));

        const hasExactTime = airstamp !== null;
        // Prefer TVMaze's exact airstamp; fall back to noon UTC on the TMDB date
        // to avoid the date shifting backwards in US timezones.
        const airDateUtc = hasExactTime
          ? new Date(airstamp)
          : new Date(air_date + "T12:00:00Z");

        await prisma.episode.upsert({
          where: {
            mediaId_episodeNumber: {
              mediaId: media.id,
              episodeNumber: episode_number,
            },
          },
          update: { airDateUtc, hasExactTime },
          create: {
            mediaId: media.id,
            episodeNumber: episode_number,
            airDateUtc,
            hasExactTime,
          },
        });
      }

      upserted++;
    } catch (error) {
      errors++;
      console.error(`Failed to upsert TMDB show ID ${show.id}:`, error);
    }
  }

  /**
   * Mark any previously-RELEASING show that wasn't in this sync as ENDED.
   * This keeps the DB in sync with TMDB's on_the_air list automatically.
   */
  const { count: retired } = await prisma.media.updateMany({
    where: {
      status: "RELEASING",
      tmdbId: { notIn: syncedTmdbIds },
    },
    data: { status: "ENDED" },
  });

  console.log(
    `Sync complete. Upserted: ${upserted}, Retired: ${retired}, Errors: ${errors}`,
  );
  return { upserted, errors };
}
