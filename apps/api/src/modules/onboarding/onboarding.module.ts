import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompetencyModule } from '../competency/competency.module';

@Module({
  imports: [PrismaModule, CompetencyModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
