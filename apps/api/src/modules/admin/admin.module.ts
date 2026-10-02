import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompetencyModule } from '../competency/competency.module';

@Module({
  imports: [PrismaModule, CompetencyModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
