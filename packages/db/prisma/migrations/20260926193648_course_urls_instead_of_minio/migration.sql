/*
  Warnings:

  - You are about to drop the `course_resources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_resources" DROP CONSTRAINT "course_resources_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "course_resources" DROP CONSTRAINT "course_resources_uploadedById_fkey";

-- AlterTable
ALTER TABLE "course_modules" ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- DropTable
DROP TABLE "course_resources";

-- DropEnum
DROP TYPE "ResourceType";
