import { prisma } from "../lib/prisma.js";
import { fetchOnAirShows, buildCoverImageUrl, buildLogoUrl } from "./tmdb.service.js";

export interface SyncResult {
  upserted: number;
  errors: number;
}

export async function runSync(): Promise<SyncResult> {
  console.log("Sync started.");
  const shows = await fetchOnAirShows();

  let upserted = 0;
  let errors = 0;

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

      if (show.next_episode_to_air !== null) {
        const { episode_number, air_date } = show.next_episode_to_air;
        // Append noon UTC to avoid the date shifting backwards when Calendar.tsx
        // converts to US timezones (a bare "YYYY-MM-DD" parses as midnight UTC)
        const airDateUtc = new Date(air_date + "T12:00:00Z");

        await prisma.episode.upsert({
          where: {
            mediaId_episodeNumber: {
              mediaId: media.id,
              episodeNumber: episode_number,
            },
          },
          update: { airDateUtc },
          create: {
            mediaId: media.id,
            episodeNumber: episode_number,
            airDateUtc,
          },
        });
      }

      upserted++;
    } catch (error) {
      errors++;
      console.error(`Failed to upsert TMDB show ID ${show.id}:`, error);
    }
  }

  console.log(`Sync complete. Upserted: ${upserted}, Errors: ${errors}`);
  return { upserted, errors };
}
