//./apps/api/src/step/step.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Step } from './step.entity';
import { Project } from '../project/project.entity';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { QueryFailedError } from 'typeorm';
import {
  ProjectNotFoundError,
  StepNotFoundError,
  DuplicateStepOrderError,
} from '../common/errors';

const PG_UNIQUE_VIOLATION = '23505' as const;

function getPgCode(e: unknown): string | undefined {
  if (!(e instanceof QueryFailedError)) return undefined;
  // Treat driverError as unknown and narrow safely
  const code = (e as { driverError?: { code?: unknown } }).driverError?.code;
  return typeof code === 'string' ? code : undefined;
}

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(Step) private readonly steps: Repository<Step>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  private async assertProjectExists(projectId: string) {
    const exists = await this.projects.exists({ where: { id: projectId } });
    if (!exists) throw new ProjectNotFoundError(projectId);
  }

  async create(projectId: string, dto: CreateStepDto): Promise<Step> {
    await this.assertProjectExists(projectId);
    const step = this.steps.create({
      ...dto,
      project: { id: projectId },
    });
    try {
      return await this.steps.save(step);
    } catch (err: unknown) {
      if (getPgCode(err) === PG_UNIQUE_VIOLATION) {
        throw new DuplicateStepOrderError(projectId, dto.order);
      }
      throw err;
    }
  }

  async findAll(
    projectId: string,
    opts?: { orderBy?: 'order' | 'createdAt' },
  ): Promise<Step[]> {
    await this.assertProjectExists(projectId);
    const sortKey: 'order' | 'createdAt' = opts?.orderBy ?? 'order';
    return this.steps.find({
      where: { project: { id: projectId } },
      order: { [sortKey]: 'ASC' },
    });
  }

  async findOne(projectId: string, id: string): Promise<Step> {
    const step = await this.steps.findOne({
      where: { id, project: { id: projectId } },
    });
    if (!step) throw new StepNotFoundError(id, projectId);
    return step;
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateStepDto,
  ): Promise<Step> {
    const step = await this.steps.findOne({
      where: { id, project: { id: projectId } },
    });
    if (!step) throw new StepNotFoundError(id, projectId);

    this.steps.merge(step, dto); // or Object.assign(step, dto);
    try {
      return await this.steps.save(step);
    } catch (err: unknown) {
      if (getPgCode(err) === PG_UNIQUE_VIOLATION) {
        const conflictOrder = dto.order ?? step.order;
        throw new DuplicateStepOrderError(projectId, conflictOrder);
      }
      throw err;
    }
  }

  async remove(projectId: string, id: string): Promise<void> {
    const res = await this.steps
      .createQueryBuilder()
      .delete()
      .from(Step)
      .where('id = :id AND "projectId" = :projectId', { id, projectId })
      .execute();

    if (!res.affected) throw new StepNotFoundError(id, projectId);
  }
}
