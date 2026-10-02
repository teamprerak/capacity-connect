import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { EvidenceService } from '../competency/evidence.service';
import { MatchingService } from '../matching/matching.service';
import { UpdateTraineeProfileDto } from './dto/update-trainee-profile.dto';
import { CreateInterestDto } from './dto/create-interest.dto';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { CreateQualificationDto } from './dto/create-qualification.dto';

@Injectable()
export class TraineeService {
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly evidenceService: EvidenceService,
    private readonly matchingService: MatchingService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.traineeProfile.findUnique({
      where: { userId },
      include: {
        department: true,
        interests: true,
        workExperiences: true,
        qualifications: true,
      },
    });
    if (!profile) {
      throw new NotFoundException('Trainee profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateTraineeProfileDto) {
    const profile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Trainee profile not found');

    // M-3: Audit profile updates so changes are traceable
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.traineeProfile.update({
        where: { id: profile.id },
        data,
      });
      await this.auditService.log({
        actorUserId: userId,
        action: 'trainee.profile.updated',
        entityType: 'TraineeProfile',
        entityId: profile.id,
        ipAddress: null,
        metadata: null,
        prisma: tx,
      });
      return updated;
    });
  }

  async addInterest(userId: string, data: CreateInterestDto) {
    const profile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Trainee profile not found');

    // M-3: Audit interest additions
    return this.prisma.$transaction(async (tx) => {
      const interest = await tx.interest.create({
        data: { ...data, traineeProfileId: profile.id },
      });
      await this.auditService.log({
        actorUserId: userId,
        action: 'trainee.interest.added',
        entityType: 'Interest',
        entityId: interest.id,
        ipAddress: null,
        metadata: { interestName: data.interestName },
        prisma: tx,
      });
      return interest;
    });
  }

  async addWorkExperience(userId: string, data: CreateWorkExperienceDto) {
    const profile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Trainee profile not found');

    // M-3: Audit work experience additions
    return this.prisma.$transaction(async (tx) => {
      const experience = await tx.workExperience.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          traineeProfileId: profile.id,
        },
      });
      await this.auditService.log({
        actorUserId: userId,
        action: 'trainee.work_experience.added',
        entityType: 'WorkExperience',
        entityId: experience.id,
        ipAddress: null,
        metadata: { organization: data.organization, role: data.role },
        prisma: tx,
      });
      return experience;
    });
  }

  async addQualification(userId: string, data: CreateQualificationDto) {
    const profile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Trainee profile not found');

    // M-3: Audit qualification additions
    return this.prisma.$transaction(async (tx) => {
      const qualification = await tx.qualification.create({
        data: {
          ...data,
          profileOwnerId: profile.id,
          profileOwnerType: 'trainee',
        },
      });
      await this.auditService.log({
        actorUserId: userId,
        action: 'trainee.qualification.added',
        entityType: 'Qualification',
        entityId: qualification.id,
        ipAddress: null,
        metadata: { degree: data.degree },
        prisma: tx,
      });
      return qualification;
    });
  }

  async getWizardSkills(): Promise<any> {
    const skills = await this.prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true, description: true },
    });
    // Group by category
    const grouped: Record<string, any[]> = {};
    for (const s of skills) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    }
    return Object.entries(grouped).map(([category, skills]) => ({ category, skills }));
  }

  async submitWizard(userId: string, domainSkillIds: string[]): Promise<any> {
    let traineeProfile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!traineeProfile) throw new NotFoundException('Trainee profile not found');

    const evidenceItems: any[] = [];
    const validSkillIds: string[] = [];

    for (const skillId of domainSkillIds) {
      const compSkill = await this.prisma.competencySkill.findFirst({
        where: { skillId },
        include: { competency: true },
      });
      if (!compSkill) continue;
      validSkillIds.push(skillId);

      // Upsert TraineeCompetency with requiredLevel=5 (ALWAYS server-side)
      let tc = await this.prisma.traineeCompetency.findUnique({
        where: { traineeProfileId_competencyId: { traineeProfileId: traineeProfile.id, competencyId: compSkill.competencyId } },
      });
      if (!tc) {
        tc = await this.prisma.traineeCompetency.create({
          data: { traineeProfileId: traineeProfile.id, competencyId: compSkill.competencyId, currentLevel: 1, requiredLevel: 5 },
        });
      } else {
        await this.prisma.traineeCompetency.update({
          where: { id: tc.id },
          data: { requiredLevel: 5 },
        });
      }

      // level=1 ALWAYS server-side, type=SELF_REPORTED ALWAYS server-side
      evidenceItems.push({
        traineeCompetencyId: tc.id,
        type: 'SELF_REPORTED',
        level: 1,
        sourceRefId: `wizard:${skillId}`,
      });
    }

    // Delete SELF_REPORTED evidence for deselected domains
    const allTCs = await this.prisma.traineeCompetency.findMany({
      where: { traineeProfileId: traineeProfile.id },
      include: { evidence: { where: { type: 'SELF_REPORTED' } } },
    });
    for (const tc of allTCs) {
      for (const ev of tc.evidence) {
        if (ev.sourceRefId.startsWith('wizard:')) {
          const evSkillId = ev.sourceRefId.replace('wizard:', '');
          if (!validSkillIds.includes(evSkillId)) {
            await this.prisma.competencyEvidence.delete({ where: { id: ev.id } });
          }
        }
      }
    }

    // Record batch evidence
    if (evidenceItems.length > 0) {
      const { EvidenceType } = await import('@repo/db');
      const typedItems = evidenceItems.map(i => ({ ...i, type: EvidenceType.SELF_REPORTED }));
      await this.evidenceService.recordEvidenceBatch(typedItems);
    }

    // Recompute matches
    const matches = await this.matchingService.computeMatchesForTrainee(userId);
    return { message: 'Wizard submitted', selectedSkills: validSkillIds.length, matches };
  }

  async getMyMatches(userId: string): Promise<any> {
    return this.matchingService.computeMatchesForTrainee(userId);
  }

  async getRecommendedAssessment() {
    const assessment = await this.prisma.assessment.findFirst({
      include: { 
        course: true,
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    return assessment;
  }
}
