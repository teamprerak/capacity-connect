-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('QUIZ_INFERRED', 'SELF_REPORTED', 'BEHAVIORAL', 'ASSESSED');

-- AlterTable
ALTER TABLE "course_modules" ADD COLUMN     "assessmentJson" JSONB,
ADD COLUMN     "textContent" TEXT;

-- AlterTable
ALTER TABLE "trainee_competencies" ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastEvidenceAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "competency_evidence" (
    "id" TEXT NOT NULL,
    "traineeCompetencyId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "level" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "sourceRefId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "competency_evidence_traineeCompetencyId_idx" ON "competency_evidence"("traineeCompetencyId");

-- CreateIndex
CREATE UNIQUE INDEX "competency_evidence_traineeCompetencyId_type_sourceRefId_key" ON "competency_evidence"("traineeCompetencyId", "type", "sourceRefId");

-- AddForeignKey
ALTER TABLE "competency_evidence" ADD CONSTRAINT "competency_evidence_traineeCompetencyId_fkey" FOREIGN KEY ("traineeCompetencyId") REFERENCES "trainee_competencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
