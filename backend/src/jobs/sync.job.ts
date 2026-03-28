import cron from "node-cron";
import { runSync } from "../services/sync.service.js";

export function startSyncJob(): void {
  // Runs daily at 00:00 UTC
  cron.schedule("0 0 * * *", async () => {
    console.log("Cron job: starting scheduled sync...");
    try {
      const result = await runSync();
      console.log("Cron job: sync finished.", result);
    } catch (error) {
      console.error("Cron job: sync failed with an unhandled error:", error);
    }
  }, { timezone: "UTC" });

  console.log("Sync cron job scheduled (daily at 00:00 UTC).");
}
