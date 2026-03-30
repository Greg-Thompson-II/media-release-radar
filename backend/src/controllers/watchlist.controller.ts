import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// TODO (Phase 3): Replace with authenticated user ID from session/JWT
const MOCK_USER_EMAIL = "mock-user@media-radar.dev";

export async function addToWatchlist(
  req: Request,
  res: Response
): Promise<void> {
  const { mediaId } = req.body as { mediaId?: string };

  if (typeof mediaId !== "string" || mediaId.trim() === "") {
    res.status(400).json({ message: "mediaId is required" });
    return;
  }

  try {
    // Verify the media title exists before attempting to track it
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (media === null) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    // Ensure the mock user exists (Phase 3 will replace with real auth)
    const mockUser = await prisma.user.upsert({
      where: { email: MOCK_USER_EMAIL },
      update: {},
      create: { email: MOCK_USER_EMAIL },
    });

    // Upsert is idempotent — safe to call multiple times for the same show
    const trackedMedia = await prisma.trackedMedia.upsert({
      where: {
        userId_mediaId: { userId: mockUser.id, mediaId },
      },
      update: {},
      create: { userId: mockUser.id, mediaId },
    });

    res.status(201).json({ message: "Added to watchlist", trackedMedia });
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    res.status(500).json({ message: "Failed to add to watchlist" });
  }
}

export async function removeFromWatchlist(
  req: Request,
  res: Response
): Promise<void> {
  const { mediaId } = req.body as { mediaId?: string };

  if (typeof mediaId !== "string" || mediaId.trim() === "") {
    res.status(400).json({ message: "mediaId is required" });
    return;
  }

  try {
    const mockUser = await prisma.user.findUnique({
      where: { email: MOCK_USER_EMAIL },
    });

    if (mockUser === null) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.trackedMedia.delete({
      where: {
        userId_mediaId: { userId: mockUser.id, mediaId },
      },
    });

    res.status(200).json({ message: "Removed from watchlist" });
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    res.status(500).json({ message: "Failed to remove from watchlist" });
  }
}
