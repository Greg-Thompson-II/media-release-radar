import { Router } from "express";
import {
  getReleasingMedia,
  getMediaById,
} from "../controllers/media.controller.js";

const router = Router();

router.get("/", getReleasingMedia);
router.get("/:id", getMediaById);

export default router;
