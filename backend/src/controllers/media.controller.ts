import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string;
}

interface MediaResponseItem {
  id: string;
  aniListId: number;
  title: string;
  coverImage: string | null;
  status: string;
  nextAiringEpisode: MediaNextAiringEpisode | null;
}

export async function getReleasingMedia(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const mediaList = await prisma.media.findMany({
      where: { status: "RELEASING" },
      include: {
        episodes: {
          where: { airDateUtc: { gte: new Date() } },
          orderBy: { airDateUtc: "asc" },
          take: 1,
        },
      },
      orderBy: { title: "asc" },
    });

    const response: MediaResponseItem[] = mediaList.map((media) => ({
      id: media.id,
      aniListId: media.aniListId,
      title: media.title,
      coverImage: media.coverImage,
      status: media.status,
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
