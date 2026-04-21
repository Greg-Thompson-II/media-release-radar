import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export async function addToWatchlist(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = getAuth(req);
  if (userId === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { mediaId } = req.body as { mediaId?: string };
  if (typeof mediaId !== "string" || mediaId.trim() === "") {
    res.status(400).json({ message: "mediaId is required" });
    return;
  }

  try {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (media === null) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    // Fetch the primary email from Clerk's backend API
    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;

    if (primaryEmail === undefined) {
      res.status(400).json({ message: "Could not resolve primary email from Clerk" });
      return;
    }

    // Upsert the Clerk user into our DB so we have a local FK to track against
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email: primaryEmail },
      create: { clerkId: userId, email: primaryEmail },
    });

    // Upsert is idempotent — safe to call multiple times for the same show
    const trackedMedia = await prisma.trackedMedia.upsert({
      where: {
        userId_mediaId: { userId: user.id, mediaId },
      },
      update: {},
      create: { userId: user.id, mediaId },
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
  const { userId } = getAuth(req);
  if (userId === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { mediaId } = req.body as { mediaId?: string };
  if (typeof mediaId !== "string" || mediaId.trim() === "") {
    res.status(400).json({ message: "mediaId is required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user === null) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.trackedMedia.delete({
      where: {
        userId_mediaId: { userId: user.id, mediaId },
      },
    });

    res.status(200).json({ message: "Removed from watchlist" });
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    res.status(500).json({ message: "Failed to remove from watchlist" });
  }
}
