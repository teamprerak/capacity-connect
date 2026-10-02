import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompetencyModule } from '../competency/competency.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [PrismaModule, CompetencyModule, MatchingModule],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
