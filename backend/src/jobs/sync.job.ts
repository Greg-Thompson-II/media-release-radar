import cron from "node-cron";
import { runSync } from "../services/sync.service.js";
import { sendShowNotification } from "../services/email.service.js";
import { prisma } from "../lib/prisma.js";

// Returns episodes whose airDateUtc falls in the one-minute window that is
// `offsetMinutes` from now. offsetMinutes=0 means "airing right now";
// offsetMinutes=15 means "airing in 15 minutes" (for early-notification users).
async function getEpisodesAiringIn(offsetMinutes: number) {
  const target = new Date(Date.now() + offsetMinutes * 60_000);

  const windowStart = new Date(target);
  windowStart.setSeconds(0, 0);

  const windowEnd = new Date(target);
  windowEnd.setSeconds(59, 999);

  console.log(
    `[Notify] offset=${offsetMinutes}min — window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
  );

  return prisma.episode.findMany({
    where: {
      airDateUtc: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    include: {
      media: {
        include: {
          trackedBy: {
            where: { notify: true },
            include: { user: true },
          },
        },
      },
    },
  });
}

export function startSyncJob(): void {
  // Runs daily at 00:00 UTC
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("Cron job: starting scheduled sync...");
      try {
        const result = await runSync();
        console.log("Cron job: sync finished.", result);
      } catch (error) {
        console.error("Cron job: sync failed with an unhandled error:", error);
      }
    },
    { timezone: "UTC" },
  );

  // Notification job: runs every minute, notifies users tracking shows airing now
  cron.schedule(
    "* * * * *",
    async () => {
      let episodes;
      try {
        episodes = await getEpisodesAiringIn(0);
      } catch (error) {
        console.error("[Notify] Failed to query airing episodes:", error);
        return;
      }

      console.log(
        `[Notify] Found ${episodes.length} episode(s) airing this minute.`,
      );

      for (const episode of episodes) {
        for (const tracked of episode.media.trackedBy) {
          try {
            await sendShowNotification(tracked.user.email, episode.media.title);
          } catch (error) {
            console.error(
              `[Notify] Failed for "${episode.media.title}" → ${tracked.user.email}:`,
              error,
            );
          }
        }
      }
    },
    { timezone: "UTC" },
  );

  console.log("Sync cron job scheduled (daily at 00:00 UTC).");
  console.log("Notification cron job scheduled (every minute).");
}
