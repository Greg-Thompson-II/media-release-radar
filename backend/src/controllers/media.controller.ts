import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// TODO (Phase 3): Replace with authenticated user ID from session/JWT
const MOCK_USER_EMAIL = "mock-user@media-radar.dev";

interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string;
}

interface MediaResponseItem {
  id: string;
  tmdbId: number;
  title: string;
  coverImage: string | null;
  status: string;
  isTracked: boolean;
  nextAiringEpisode: MediaNextAiringEpisode | null;
}

export async function getReleasingMedia(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    // Upsert mock user so we can check tracking state even on first load
    const mockUser = await prisma.user.upsert({
      where: { email: MOCK_USER_EMAIL },
      update: {},
      create: { email: MOCK_USER_EMAIL },
    });

    const mediaList = await prisma.media.findMany({
      where: { status: "RELEASING" },
      include: {
        episodes: {
          where: { airDateUtc: { gte: new Date() } },
          orderBy: { airDateUtc: "asc" },
          take: 1,
        },
        trackedBy: {
          where: { userId: mockUser.id },
          take: 1,
        },
      },
      orderBy: { title: "asc" },
    });

    const response: MediaResponseItem[] = mediaList.map((media) => ({
      id: media.id,
      tmdbId: media.tmdbId,
      title: media.title,
      coverImage: media.coverImage,
      status: media.status,
      isTracked: media.trackedBy.length > 0,
      nextAiringEpisode:
        media.episodes[0] !== undefined
          ? {
              episodeNumber: media.episodes[0].episodeNumber,
              airDateUtc: media.episodes[0].airDateUtc.toISOString(),
            }
          : null,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch releasing media:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
}
