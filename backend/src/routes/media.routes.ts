import { Router } from "express";
import { getReleasingMedia } from "../controllers/media.controller.js";

const router = Router();

router.get("/", getReleasingMedia);

export default router;
