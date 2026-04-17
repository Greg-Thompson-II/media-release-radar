-- Wipe stale mock user data before restructuring the User table.
-- TrackedMedia rows cascade-delete via the FK, so we only need to truncate User.
TRUNCATE TABLE "User" CASCADE;

-- Drop the old email column and add clerkId as the new unique identifier
ALTER TABLE "User" DROP COLUMN "email";
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
