-- AlterTable
ALTER TABLE "users" ADD COLUMN "suspendedBy" TEXT,
ADD COLUMN "statusUpdatedBy" TEXT,
ADD COLUMN "statusUpdatedAt" TIMESTAMP(3);
