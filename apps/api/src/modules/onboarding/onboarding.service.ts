import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async submitOnboarding(userId: string, onboardingData: any): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Process and store the answers
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingData, // JSON containing all questions and answers
      },
    });

    return updatedUser;
  }

  async getOnboardingStatus(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true, onboardingData: true },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getOnboardingQuestions(role: 'trainee' | 'trainer'): any[] {
    if (role === 'trainee') {
      return [
        { id: 'tq1', question: 'What are your primary responsibilities or the type of work you currently perform?', type: 'multiple_choice_other' },
        { id: 'tq2', question: 'How confident are you in performing the core tasks required for your current role independently?', type: 'rating_1_5' },
        { id: 'tq3', question: 'Which professional skills do you feel you need to improve the most?', type: 'multi_select' },
        { id: 'tq4', question: 'When you are given a new or unfamiliar task, what do you usually do first?', type: 'scenario_mcq' },
        { id: 'tq5', question: 'How comfortable are you with communicating your ideas, questions, or concerns to colleagues or supervisors?', type: 'rating_1_5' },
        { id: 'tq6', question: 'How effectively do you manage your time when you have multiple tasks or deadlines?', type: 'rating_1_5' },
        { id: 'tq7', question: 'How comfortable are you working with people who have different opinions, backgrounds, or working styles?', type: 'rating_1_5' },
        { id: 'tq8', question: 'When you make a mistake at work, what do you typically do?', type: 'scenario_mcq' },
        { id: 'tq9', question: 'How do you prefer to learn a new skill?', type: 'multi_select' },
        { id: 'tq10', question: 'What professional goal would you most like to achieve through Capacity Connect?', type: 'short_answer_optional' },
      ];
    } else {
      return [
        { id: 'tr1', question: 'What type of learners or professional roles do you have experience training?', type: 'multi_select_other' },
        { id: 'tr2', question: 'How would you assess a trainee\'s current competency before starting a training program?', type: 'scenario_mcq_short' },
        { id: 'tr3', question: 'How confident are you in explaining complex concepts to people with different levels of knowledge?', type: 'rating_1_5' },
        { id: 'tr4', question: 'How do you identify the specific skills a trainee is struggling with?', type: 'mcq_short' },
        { id: 'tr5', question: 'A trainee understands a concept theoretically but struggles to apply it in practice. What would you do?', type: 'scenario_mcq' },
        { id: 'tr6', question: 'How do you normally adapt your teaching approach when a trainee is not progressing as expected?', type: 'mcq_short' },
        { id: 'tr7', question: 'How do you provide feedback when a trainee makes repeated mistakes?', type: 'scenario_mcq' },
        { id: 'tr8', question: 'How do you determine whether a trainee has actually developed a skill after training?', type: 'multi_select_short' },
        { id: 'tr9', question: 'Which training methods are you most comfortable using?', type: 'multi_select' },
        { id: 'tr10', question: 'What outcomes do you believe a successful training program should achieve for a trainee?', type: 'short_answer' },
      ];
    }
  }
}

