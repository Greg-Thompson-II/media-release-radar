import { Request, Response } from "express";
import { runSync } from "../services/sync.service.js";

export async function triggerSync(req: Request, res: Response): Promise<void> {
  try {
    const result = await runSync();
    res.status(202).json({ message: "Sync complete", result });
  } catch (error) {
    console.error("Sync controller error:", error);
    res.status(500).json({ message: "Sync failed" });
  }
}
