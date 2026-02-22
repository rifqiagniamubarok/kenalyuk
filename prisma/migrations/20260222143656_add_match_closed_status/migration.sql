-- AlterEnum
ALTER TYPE "MatchStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedBy" TEXT,
ADD COLUMN     "closedReason" TEXT;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
