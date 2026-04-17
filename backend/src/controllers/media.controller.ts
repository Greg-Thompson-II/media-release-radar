import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w154";

interface MediaNextAiringEpisode {
  episodeNumber: number;
  airDateUtc: string;
  hasExactTime: boolean;
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

// Resolves the local DB user id for a given Clerk user id, or null if not signed in.
async function resolveLocalUserId(clerkUserId: string | null): Promise<string | null> {
  if (clerkUserId === null) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  return user?.id ?? null;
}

export async function getReleasingMedia(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const localUserId = await resolveLocalUserId(clerkUserId);

    const mediaList = await prisma.media.findMany({
      where: { status: "RELEASING" },
      include: {
        episodes: {
          where: { airDateUtc: { gte: new Date() } },
          orderBy: { airDateUtc: "asc" },
          take: 1,
        },
        trackedBy: {
          // Use a guaranteed-miss value when not signed in so isTracked is always false
          where: { userId: localUserId ?? "" },
          take: 1,
        },
      },
      orderBy: { title: "asc" }, // secondary sort; refined below
    });

    function sortKey(title: string): string {
      return title.replace(/^the\s+/i, "").toLowerCase();
    }

    mediaList.sort((a, b) => sortKey(a.title).localeCompare(sortKey(b.title)));

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
              hasExactTime: media.episodes[0].hasExactTime,
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
    const { userId: clerkUserId } = getAuth(req);
    const localUserId = await resolveLocalUserId(clerkUserId);

    const mediaWithRelations = await prisma.media.findUnique({
      where: { id },
      include: {
        episodes: {
          where: { airDateUtc: { gte: new Date() } },
          orderBy: { airDateUtc: "asc" },
          take: 1,
        },
        trackedBy: {
          where: { userId: localUserId ?? "" },
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
              hasExactTime: nextEpisode.hasExactTime,
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
