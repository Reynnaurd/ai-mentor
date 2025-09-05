//./apps/api/src/step/step.module.ts
import { Module } from '@nestjs/common';
import { StepController } from './step.controller';
import { StepService } from './step.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';
import { Step } from './step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Step, Project])],
  controllers: [StepController],
  providers: [StepService],
})
export class StepModule {}
