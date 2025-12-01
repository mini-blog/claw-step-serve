-- AlterTable: Add travelTickets to User
ALTER TABLE "users" ADD COLUMN "travelTickets" INTEGER NOT NULL DEFAULT 3;

-- AlterTable: Modify TravelPartnership
ALTER TABLE "travel_partnerships" 
  ALTER COLUMN "inviteeId" DROP NOT NULL,
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "unbindRequestedAt" TIMESTAMP(3),
  ADD COLUMN "unbindExpiresAt" TIMESTAMP(3);

-- DropIndex: Remove unique constraint
DROP INDEX IF EXISTS "travel_partnerships_inviterId_inviteeId_key";

-- CreateTable
CREATE TABLE "travels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "partnerId" TEXT,
    "partnershipId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "totalCalories" INTEGER NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travels_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "travels" ADD CONSTRAINT "travels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travels" ADD CONSTRAINT "travels_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travels" ADD CONSTRAINT "travels_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "travel_partnerships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
