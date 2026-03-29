import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import syncRouter from "./routes/sync.routes.js";
import mediaRouter from "./routes/media.routes.js";
import watchlistRouter from "./routes/watchlist.routes.js";
import { startSyncJob } from "./jobs/sync.job.js";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sync", syncRouter);
app.use("/api/media", mediaRouter);
app.use("/api/watchlist", watchlistRouter);

// Enterprise-Grade Health Check Endpoint
app.get("/api/health", async (req: Request, res: Response): Promise<void> => {
  try {
    // Ping the database to ensure the connection pool is alive
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  startSyncJob();
});
