-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'announcement';

-- AlterTable
ALTER TABLE "knowledge_hub_items" ADD COLUMN     "criticality" TEXT,
ADD COLUMN     "successionRisk" TEXT;

-- AlterTable
ALTER TABLE "trainee_profiles" ADD COLUMN     "detailedJobContext" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "specialtyTags" TEXT[];

-- AlterTable
ALTER TABLE "trainer_profiles" ADD COLUMN     "detailedJobContext" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "specialtyTags" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingData" JSONB;
