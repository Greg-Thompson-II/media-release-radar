import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { getCalendar } from "../controllers/calendar.controller.js";

const router = Router();

function enforceAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (userId === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

router.get("/", enforceAuth, getCalendar);

export default router;
