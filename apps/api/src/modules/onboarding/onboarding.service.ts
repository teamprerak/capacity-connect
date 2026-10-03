import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceService } from '../competency/evidence.service';
import { EvidenceType } from '@repo/db';
import { ONBOARDING_QUIZ_SKILL_MAP } from './quiz-skill-map';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evidenceService: EvidenceService,
  ) {}

  async submitOnboarding(userId: string, onboardingData: any): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 1. Save the raw onboarding answers
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true, onboardingData },
    });

    // 2. Process QUIZ_INFERRED evidence (awaiting to avoid floating promise)
    try {
      await this._processQuizEvidence(userId, onboardingData);
    } catch (err) {
      console.error('[Onboarding] Evidence processing failed:', err);
    }

    return updatedUser;
  }

  async getOnboardingStatus(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true, onboardingData: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  getOnboardingQuestions(role: 'trainee' | 'trainer'): any[] {
    if (role === 'trainee') {
      return [
        { id: 'tq1', question: 'What are your primary responsibilities or the type of work you currently perform?', type: 'multiple_choice_other', options: ['Administrative', 'Technical', 'Management', 'Operations', 'Field Work'] },
        { id: 'tq2', question: 'How confident are you in performing the core tasks required for your current role independently?', type: 'rating_1_5' },
        { id: 'tq3', question: 'Which professional skills do you feel you need to improve the most?', type: 'multi_select', options: ['Communication', 'Leadership', 'Technical Skills', 'Time Management', 'Problem Solving'] },
        { id: 'tq4', question: 'When you are given a new or unfamiliar task, what do you usually do first?', type: 'scenario_mcq', options: ['Ask for help immediately', 'Try to figure it out on my own', 'Look for documentation or examples', 'Break it down into smaller steps'] },
        { id: 'tq5', question: 'How comfortable are you with communicating your ideas, questions, or concerns to colleagues or supervisors?', type: 'rating_1_5' },
        { id: 'tq6', question: 'How effectively do you manage your time when you have multiple tasks or deadlines?', type: 'rating_1_5' },
        { id: 'tq7', question: 'How comfortable are you working with people who have different opinions, backgrounds, or working styles?', type: 'rating_1_5' },
        { id: 'tq8', question: 'When you make a mistake at work, what do you typically do?', type: 'scenario_mcq', options: ['Admit it immediately and seek help', 'Try to fix it before anyone notices', 'Blame external factors', 'Ignore it if it is minor'] },
        { id: 'tq9', question: 'How do you prefer to learn a new skill?', type: 'multi_select', options: ['Reading documentation', 'Watching video tutorials', 'Hands-on practice', 'Attending live classes', '1-on-1 mentorship'] },
        { id: 'tq10', question: 'What professional goal would you most like to achieve through Capacity Connect?', type: 'short_answer_optional', options: ['Get promoted', 'Learn a specific tool', 'Improve general efficiency', 'Transition to a new role'] },
      ];
    } else {
      return [
        { id: 'tr1', question: 'What type of learners or professional roles do you have experience training?', type: 'multi_select_other', options: ['Entry-level staff', 'Mid-level professionals', 'Senior management', 'Technical specialists', 'General audience'] },
        { id: 'tr2', question: 'How would you assess a trainee\'s current competency before starting a training program?', type: 'scenario_mcq_short', options: ['Pre-assessment quiz', 'One-on-one interview', 'Reviewing past work', 'Self-assessment survey'] },
        { id: 'tr3', question: 'How confident are you in explaining complex concepts to people with different levels of knowledge?', type: 'rating_1_5' },
        { id: 'tr4', question: 'How do you identify the specific skills a trainee is struggling with?', type: 'mcq_short', options: ['Observation during tasks', 'Reviewing quiz scores', 'Direct feedback from trainee', 'Peer reviews'] },
        { id: 'tr5', question: 'A trainee understands a concept theoretically but struggles to apply it in practice. What would you do?', type: 'scenario_mcq', options: ['Provide more theory', 'Demonstrate the practical application', 'Give a guided hands-on exercise', 'Pair them with an experienced peer'] },
        { id: 'tr6', question: 'How do you normally adapt your teaching approach when a trainee is not progressing as expected?', type: 'mcq_short', options: ['Slow down the pace', 'Use different analogies or visuals', 'Provide extra one-on-one time', 'Simplify the material'] },
        { id: 'tr7', question: 'How do you provide feedback when a trainee makes repeated mistakes?', type: 'scenario_mcq', options: ['Point it out immediately', 'Wait until the end of the session', 'Ask them to self-reflect', 'Provide written feedback'] },
        { id: 'tr8', question: 'How do you determine whether a trainee has actually developed a skill after training?', type: 'multi_select_short', options: ['Final exam', 'Practical demonstration', 'On-the-job observation', 'Feedback from their manager'] },
        { id: 'tr9', question: 'Which training methods are you most comfortable using?', type: 'multi_select', options: ['Lectures', 'Interactive workshops', 'E-learning modules', 'Role-playing', 'Case studies'] },
        { id: 'tr10', question: 'What outcomes do you believe a successful training program should achieve for a trainee?', type: 'short_answer' },
      ];
    }
  }

  // ─── Private: Process quiz answers into QUIZ_INFERRED evidence ───────────────

  private async _processQuizEvidence(
    userId: string,
    onboardingData: Record<string, any>,
  ): Promise<void> {
    // Ensure trainee profile exists
    let traineeProfile = await this.prisma.traineeProfile.findUnique({ where: { userId } });
    if (!traineeProfile) return; // Not a trainee — skip

    const evidenceItems: Array<{
      traineeCompetencyId: string;
      type: EvidenceType;
      level: number;
      sourceRefId: string;
    }> = [];

    for (const mapping of ONBOARDING_QUIZ_SKILL_MAP) {
      const rawAnswer = onboardingData[mapping.questionId];
      if (rawAnswer === undefined || rawAnswer === null) continue;

      if (mapping.type === 'multi_select') {
        // rawAnswer is an array of selected options
        const selected: string[] = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
        for (const option of selected) {
          const skillName = mapping.optionSkillMap?.[option];
          if (!skillName) continue;
          const item = await this._buildEvidenceItem(traineeProfile.id, skillName, 2);
          if (item) evidenceItems.push(item);
        }
      } else if (mapping.type === 'rating') {
        const level = Math.min(5, Math.max(1, parseInt(String(rawAnswer), 10)));
        if (isNaN(level)) continue;
        for (const skillName of (mapping.skillNames || [])) {
          const item = await this._buildEvidenceItem(traineeProfile.id, skillName, level);
          if (item) evidenceItems.push(item);
        }
      } else if (mapping.type === 'mcq') {
        const level = mapping.mcqLevelMap?.[String(rawAnswer)] ?? mapping.fixedLevel ?? 2;
        for (const skillName of (mapping.skillNames || [])) {
          const item = await this._buildEvidenceItem(traineeProfile.id, skillName, level);
          if (item) evidenceItems.push(item);
        }
      }
    }

    if (evidenceItems.length > 0) {
      await this.evidenceService.recordEvidenceBatch(evidenceItems);
    }
  }

  private async _buildEvidenceItem(
    traineeProfileId: string,
    skillName: string,
    level: number,
  ): Promise<{ traineeCompetencyId: string; type: EvidenceType; level: number; sourceRefId: string } | null> {
    // 1. Find skill by name
    const skill = await this.prisma.skill.findFirst({
      where: { name: { equals: skillName, mode: 'insensitive' } },
    });
    if (!skill) return null;

    // 2. Find competency that includes this skill
    const compSkill = await this.prisma.competencySkill.findFirst({
      where: { skillId: skill.id },
      include: { competency: true },
    });
    if (!compSkill) return null;

    // 3. Upsert TraineeCompetency
    let tc = await this.prisma.traineeCompetency.findUnique({
      where: {
        traineeProfileId_competencyId: {
          traineeProfileId,
          competencyId: compSkill.competencyId,
        },
      },
    });
    if (!tc) {
      tc = await this.prisma.traineeCompetency.create({
        data: {
          traineeProfileId,
          competencyId: compSkill.competencyId,
          currentLevel: 1,
          requiredLevel: 3,
        },
      });
    }

    return {
      traineeCompetencyId: tc.id,
      type: EvidenceType.QUIZ_INFERRED,
      level,
      sourceRefId: 'quiz:onboarding',
    };
  }
}
