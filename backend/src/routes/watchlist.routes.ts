import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";

const router = Router();

function enforceAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (userId === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

router.post("/", enforceAuth, addToWatchlist);
router.delete("/", enforceAuth, removeFromWatchlist);

export default router;
