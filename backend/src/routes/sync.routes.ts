import { Router } from "express";
import { triggerSync } from "../controllers/sync.controller.js";

const router = Router();

router.post("/releases", triggerSync);

export default router;
