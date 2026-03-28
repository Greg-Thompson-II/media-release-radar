import { prisma } from "../lib/prisma.js";
import { fetchReleasingMedia } from "./anilist.service.js";

export interface SyncResult {
  upserted: number;
  errors: number;
}

export async function runSync(): Promise<SyncResult> {
  console.log("Sync started.");
  const mediaList = await fetchReleasingMedia();

  let upserted = 0;
  let errors = 0;

  for (const item of mediaList) {
    try {
      const media = await prisma.media.upsert({
        where: { aniListId: item.id },
        update: {
          title: item.title.romaji,
          coverImage: item.coverImage.large ?? null,
          status: item.status,
        },
        create: {
          aniListId: item.id,
          title: item.title.romaji,
          coverImage: item.coverImage.large ?? null,
          status: item.status,
        },
      });

      if (item.nextAiringEpisode !== null) {
        const { episode, airingAt } = item.nextAiringEpisode;
        // Convert Unix seconds to a UTC Date object
        const airDateUtc = new Date(airingAt * 1000);

        await prisma.episode.upsert({
          where: {
            mediaId_episodeNumber: {
              mediaId: media.id,
              episodeNumber: episode,
            },
          },
          update: { airDateUtc },
          create: {
            mediaId: media.id,
            episodeNumber: episode,
            airDateUtc,
          },
        });
      }

      upserted++;
    } catch (error) {
      errors++;
      console.error(`Failed to upsert aniListId ${item.id}:`, error);
    }
  }

  console.log(`Sync complete. Upserted: ${upserted}, Errors: ${errors}`);
  return { upserted, errors };
}
