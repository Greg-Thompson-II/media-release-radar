import { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";

const router = Router();

router.post("/", addToWatchlist);
router.delete("/", removeFromWatchlist);

export default router;
