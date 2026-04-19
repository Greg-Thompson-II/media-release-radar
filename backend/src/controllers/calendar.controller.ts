import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

interface CalendarEpisode {
  episodeNumber: number;
  airDateUtc: string;
  hasExactTime: boolean;
}

interface CalendarItem {
  id: string;
  media: {
    title: string;
    coverImage: string | null;
    network: string | null;
  };
  nextAiringEpisode: CalendarEpisode;
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  const { userId: clerkUserId } = getAuth(req);

  // enforceAuth middleware guarantees this, but guard defensively
  if (clerkUserId === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    // User exists in Clerk but hasn't tracked anything yet — return empty list
    if (user === null) {
      res.status(200).json([]);
      return;
    }

    const tracked = await prisma.trackedMedia.findMany({
      where: { userId: user.id },
      include: {
        media: {
          include: {
            episodes: {
              where: { airDateUtc: { gte: new Date() } },
              orderBy: { airDateUtc: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    const withEpisodes: CalendarItem[] = tracked
      .filter((t) => t.media.episodes[0] !== undefined)
      .map((t) => {
        const ep = t.media.episodes[0];
        return {
          id: t.media.id,
          media: {
            title: t.media.title,
            coverImage: t.media.coverImage,
            network: t.media.network,
          },
          nextAiringEpisode: {
            episodeNumber: ep.episodeNumber,
            airDateUtc: ep.airDateUtc.toISOString(),
            hasExactTime: ep.hasExactTime,
          },
        };
      })
      .sort(
        (a, b) =>
          new Date(a.nextAiringEpisode.airDateUtc).getTime() -
          new Date(b.nextAiringEpisode.airDateUtc).getTime()
      );

    res.status(200).json(withEpisodes);
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    res.status(500).json({ message: "Failed to fetch calendar" });
  }
}
