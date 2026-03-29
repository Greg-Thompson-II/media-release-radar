import { Router } from "express";
import { addToWatchlist } from "../controllers/watchlist.controller.js";

const router = Router();

router.post("/", addToWatchlist);

export default router;
