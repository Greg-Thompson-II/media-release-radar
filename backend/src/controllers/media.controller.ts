import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// TODO (Phase 3): Replace with authenticated user ID from session/JWT
const MOCK_USER_EMAIL = "mock-user@media-radar.dev";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w154";

interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string;
}

interface MediaResponseItem {
  id: string;
  tmdbId: number;
  title: string;
  coverImage: string | null;
  network: string | null;
  networkLogoUrl: string | null;
  status: string;
  isTracked: boolean;
  nextAiringEpisode: MediaNextAiringEpisode | null;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

interface TMDBDetailResponse {
  overview: string;
  genres: TMDBGenre[];
  networks: TMDBNetwork[];
  number_of_seasons: number;
  number_of_episodes: number;
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
      network: media.network,
      networkLogoUrl: media.networkLogoUrl,
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

export async function getMediaById(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  const id = req.params.id;

  try {
    const mockUser = await prisma.user.upsert({
      where: { email: MOCK_USER_EMAIL },
      update: {},
      create: { email: MOCK_USER_EMAIL },
    });

    const mediaWithRelations = await prisma.media.findUnique({
      where: { id },
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
    });

    if (mediaWithRelations === null) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    // Fetch extended details from TMDB
    const tmdbRes = await fetch(`${TMDB_BASE_URL}/tv/${mediaWithRelations.tmdbId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
      },
    });

    if (!tmdbRes.ok) {
      res.status(502).json({ message: "Failed to fetch details from TMDB" });
      return;
    }

    const tmdbDetail = (await tmdbRes.json()) as TMDBDetailResponse;
    const nextEpisode = mediaWithRelations.episodes[0];

    res.status(200).json({
      id: mediaWithRelations.id,
      tmdbId: mediaWithRelations.tmdbId,
      title: mediaWithRelations.title,
      coverImage: mediaWithRelations.coverImage,
      status: mediaWithRelations.status,
      isTracked: mediaWithRelations.trackedBy.length > 0,
      nextAiringEpisode:
        nextEpisode !== undefined
          ? {
              episodeNumber: nextEpisode.episodeNumber,
              airDateUtc: nextEpisode.airDateUtc.toISOString(),
            }
          : null,
      overview: tmdbDetail.overview || null,
      genres: tmdbDetail.genres.map((g) => g.name),
      networks: tmdbDetail.networks.map((n) => ({
        name: n.name,
        logoUrl: n.logo_path ? `${TMDB_LOGO_BASE}${n.logo_path}` : null,
      })),
      numberOfSeasons: tmdbDetail.number_of_seasons,
      numberOfEpisodes: tmdbDetail.number_of_episodes,
    });
  } catch (error) {
    console.error("Failed to fetch media by id:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
}
