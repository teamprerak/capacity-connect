import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceType, GapClassification } from '@repo/db';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Confidence weights per evidence source */
const SOURCE_WEIGHTS: Record<EvidenceType, number> = {
  ASSESSED: 1.0,
  SELF_REPORTED: 0.5,
  QUIZ_INFERRED: 0.4,
  BEHAVIORAL: 0.1,
};

/** Max cumulative weight for behavioral evidence */
const BEHAVIORAL_CAP = 0.3;

/** Score-to-level mapping for assessment results (percentage → 1-5 scale) */
const SCORE_TO_LEVEL: Array<{ maxPct: number; level: number }> = [
  { maxPct: 20, level: 1 },
  { maxPct: 40, level: 2 },
  { maxPct: 60, level: 3 },
  { maxPct: 80, level: 4 },
  { maxPct: 100, level: 5 },
];

/** Difficulty enum → numeric baseline level for behavioral evidence */
const DIFFICULTY_TO_LEVEL: Record<string, number> = {
  beginner: 1,
  intermediate: 3,
  advanced: 5,
};

/** Gap value → classification */
const GAP_CLASSIFICATION: Record<number, GapClassification> = {
  0: GapClassification.none,
  1: GapClassification.low,
  2: GapClassification.medium,
  3: GapClassification.high,
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public API ───────────────────────────────────────────────────────────────

  /**
   * Upsert a single evidence row and recompute the parent competency.
   *
   * @param traineeCompetencyId — The TraineeCompetency this evidence belongs to
   * @param type                — QUIZ_INFERRED | SELF_REPORTED | BEHAVIORAL | ASSESSED
   * @param level               — The observed proficiency level (1-5 scale)
   * @param sourceRefId         — Stable reference, e.g. "quiz:onboarding", "wizard:<skillId>", moduleId
   *
   * Runs the upsert + recompute inside a single transaction.
   * Weight is always derived from the `type` — never accepted from the caller.
   */
  async recordEvidence(
    traineeCompetencyId: string,
    type: EvidenceType,
    level: number,
    sourceRefId: string,
  ): Promise<void> {
    const weight = SOURCE_WEIGHTS[type];

    await this.prisma.$transaction(async (tx) => {
      // Verify the competency exists
      const tc = await tx.traineeCompetency.findUnique({
        where: { id: traineeCompetencyId },
      });
      if (!tc) {
        throw new NotFoundException(
          `TraineeCompetency ${traineeCompetencyId} not found`,
        );
      }

      // Upsert the evidence row (idempotent on [traineeCompetencyId, type, sourceRefId])
      await tx.competencyEvidence.upsert({
        where: {
          traineeCompetencyId_type_sourceRefId: {
            traineeCompetencyId,
            type,
            sourceRefId,
          },
        },
        create: {
          traineeCompetencyId,
          type,
          level,
          weight,
          sourceRefId,
        },
        update: {
          level,
          weight,
          // updatedAt is auto-set by @updatedAt
        },
      });

      // Recompute the competency from all evidence
      await this.recomputeCompetency(tx, traineeCompetencyId);
    });
  }

  /**
   * Record multiple evidence rows for the same trainee across different competencies,
   * then recompute each affected competency. All in one transaction.
   */
  async recordEvidenceBatch(
    items: Array<{
      traineeCompetencyId: string;
      type: EvidenceType;
      level: number;
      sourceRefId: string;
    }>,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const affectedIds = new Set<string>();

      for (const item of items) {
        const weight = SOURCE_WEIGHTS[item.type];

        await tx.competencyEvidence.upsert({
          where: {
            traineeCompetencyId_type_sourceRefId: {
              traineeCompetencyId: item.traineeCompetencyId,
              type: item.type,
              sourceRefId: item.sourceRefId,
            },
          },
          create: {
            traineeCompetencyId: item.traineeCompetencyId,
            type: item.type,
            level: item.level,
            weight,
            sourceRefId: item.sourceRefId,
          },
          update: {
            level: item.level,
            weight,
          },
        });

        affectedIds.add(item.traineeCompetencyId);
      }

      // Recompute each distinct competency once
      for (const tcId of affectedIds) {
        await this.recomputeCompetency(tx, tcId);
      }
    });
  }

  /**
   * Delete all SELF_REPORTED evidence for a trainee competency (used when wizard
   * domains are deselected), then recompute.
   */
  async deleteEvidenceByType(
    traineeCompetencyId: string,
    type: EvidenceType,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.competencyEvidence.deleteMany({
        where: { traineeCompetencyId, type },
      });
      await this.recomputeCompetency(tx, traineeCompetencyId);
    });
  }

  // ─── Core Recomputation ───────────────────────────────────────────────────────

  /**
   * The single place where level and confidence are computed.
   *
   * Rules:
   *   1. If ANY ASSESSED evidence exists, currentLevel = latest ASSESSED level
   *      (latest = most recent updatedAt). Other sources only pad confidence.
   *   2. Otherwise, currentLevel = round(weighted average of all evidence).
   *   3. confidence = min(1.0, sum of effective weights).
   *      Behavioral weight is capped at BEHAVIORAL_CAP in the sum.
   *   4. Gap analysis is recomputed and persisted after level changes.
   */
  public async recomputeCompetency(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    traineeCompetencyId: string,
  ): Promise<void> {
    const allEvidence = await tx.competencyEvidence.findMany({
      where: { traineeCompetencyId },
      orderBy: { updatedAt: 'desc' },
    });

    if (allEvidence.length === 0) {
      // No evidence → reset to defaults
      await tx.traineeCompetency.update({
        where: { id: traineeCompetencyId },
        data: {
          currentLevel: 1,
          confidence: 0,
          lastEvidenceAt: new Date(),
          lastAssessedAt: null,
          assessmentScore: null,
        },
      });
      return;
    }

    // ─── Compute Level ────────────────────────────────────────────────────────

    const assessedRows = allEvidence.filter(
      (e) => e.type === EvidenceType.ASSESSED,
    );

    let computedLevel: number;

    if (assessedRows.length > 0) {
      // "Assessed Supersedes" — latest ASSESSED row determines level
      // allEvidence is already sorted by updatedAt desc, so first assessed is latest
      computedLevel = Math.round(assessedRows[0].level);
    } else {
      // Weighted average of all evidence
      let weightedSum = 0;
      let weightSum = 0;
      for (const e of allEvidence) {
        weightedSum += e.level * e.weight;
        weightSum += e.weight;
      }
      computedLevel = weightSum > 0 ? Math.round(weightedSum / weightSum) : 1;
    }

    // Clamp to 1-5
    computedLevel = Math.max(1, Math.min(5, computedLevel));

    // ─── Compute Confidence ─────────────────────────────────────────────────

    let behavioralWeightSum = 0;
    let totalEffectiveWeight = 0;

    for (const e of allEvidence) {
      if (e.type === EvidenceType.BEHAVIORAL) {
        behavioralWeightSum += e.weight;
      } else {
        totalEffectiveWeight += e.weight;
      }
    }

    // Cap behavioral contribution
    totalEffectiveWeight += Math.min(BEHAVIORAL_CAP, behavioralWeightSum);

    const confidence = Math.min(1.0, totalEffectiveWeight);

    // ─── Persist ────────────────────────────────────────────────────────────

    const tc = await tx.traineeCompetency.update({
      where: { id: traineeCompetencyId },
      data: {
        currentLevel: computedLevel,
        confidence,
        lastEvidenceAt: new Date(),
        lastAssessedAt:
          assessedRows.length > 0 ? assessedRows[0].updatedAt : null,
        assessmentScore:
          assessedRows.length > 0 ? assessedRows[0].level * 20 : null,
      },
    });

    // ─── Recompute Gap Analysis ─────────────────────────────────────────────

    const gapValue = Math.max(0, tc.requiredLevel - computedLevel);
    const gapClassification: GapClassification =
      gapValue >= 4
        ? GapClassification.critical
        : GAP_CLASSIFICATION[gapValue] ?? GapClassification.critical;

    const existingGap = await tx.skillGapAnalysis.findFirst({
      where: { traineeCompetencyId },
    });

    if (existingGap) {
      await tx.skillGapAnalysis.update({
        where: { id: existingGap.id },
        data: { gapValue, gapClassification, computedAt: new Date() },
      });
    } else {
      await tx.skillGapAnalysis.create({
        data: { traineeCompetencyId, gapValue, gapClassification },
      });
    }
  }

  // ─── Utility: Score → Level ───────────────────────────────────────────────

  /**
   * Convert an assessment score percentage (0-100) to a 1-5 level.
   */
  static scoreToLevel(scorePct: number): number {
    for (const bracket of SCORE_TO_LEVEL) {
      if (scorePct <= bracket.maxPct) return bracket.level;
    }
    return 5;
  }

  /**
   * Convert a Course difficulty enum value to a numeric level for behavioral evidence.
   */
  static difficultyToLevel(difficulty: string): number {
    return DIFFICULTY_TO_LEVEL[difficulty] ?? 1;
  }
}
