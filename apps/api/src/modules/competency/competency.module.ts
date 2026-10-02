import { Module } from '@nestjs/common';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';
import { EvidenceService } from './evidence.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompetencyController],
  providers: [CompetencyService, EvidenceService],
  exports: [CompetencyService, EvidenceService],
})
export class CompetencyModule {}
