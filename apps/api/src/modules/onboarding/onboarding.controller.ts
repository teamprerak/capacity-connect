import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  async getStatus(@CurrentUser('id') userId: string) {
    return this.onboardingService.getOnboardingStatus(userId);
  }

  @Get('questions/:role')
  getQuestions(@Param('role') role: 'trainee' | 'trainer') {
    return this.onboardingService.getOnboardingQuestions(role);
  }

  @Post('submit')
  async submitOnboarding(
    @CurrentUser('id') userId: string,
    @Body() onboardingData: any,
  ) {
    return this.onboardingService.submitOnboarding(userId, onboardingData);
  }
}
