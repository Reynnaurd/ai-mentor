//./apps/api/src/step/step.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Step } from './step.entity';
import { Project } from '../project/project.entity';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { QueryFailedError, DataSource } from 'typeorm';
import {
  ProjectNotFoundError,
  StepNotFoundError,
  DuplicateStepOrderError,
  InvalidReorderTargetError,
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
    private readonly dataSource: DataSource,
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

  async reorder(
    projectId: string,
    stepId: string,
    newOrder: number,
  ): Promise<Step[]> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      // lockedSteps is an array of Step entities (Step[]) sorted by order (1..N), and those rows are FOR UPDATE locked until commit/rollback.
      // SELECT s.* FROM step s INNER JOIN project p ON p.id = s."projectId" WHERE p.id = $1 ORDER BY s."order" ASC FOR UPDATE;
      const lockedSteps = await runner.manager
        .getRepository(Step)
        .createQueryBuilder('s')
        .innerJoin('s.project', 'p')
        .where('p.id = :projectId', { projectId })
        .setLock('pessimistic_write')
        .orderBy('s.order', 'ASC')
        .getMany();

      // If project has no steps, ensure the project exists at all:
      if (lockedSteps.length === 0) {
        const ProjectExists = await runner.manager
          .getRepository(Project)
          .exists({ where: { id: projectId } });
        if (!ProjectExists) throw new ProjectNotFoundError(projectId);
      }

      // 3) Validate target step presence and current order
      const target = lockedSteps.find((s) => s.id === stepId);
      if (!target) {
        throw new StepNotFoundError(stepId, projectId);
      }
      const currentOrder = target.order;
      const N = lockedSteps.length;

      if (newOrder < 1 || newOrder > N) {
        throw new InvalidReorderTargetError(projectId, stepId, newOrder);
      }

      if (newOrder === currentOrder) {
        await runner.commitTransaction();
        return lockedSteps; // already sorted ASC
      }

      /** 4) Park the target outside the unique range to avoid collisions */
      await runner.manager
        .createQueryBuilder()
        .update(Step)
        .set({ order: 0 }) // temporary value not used by any other row
        .where('id = :stepId', { stepId })
        .execute();

      /** 5) Shift neighbors (two-phase) BEFORE placing the target */
      if (newOrder < currentOrder) {
        // Phase A: bump out of the way
        await runner.manager
          .createQueryBuilder()
          .update(Step)
          .set({ order: () => '"order" + 1000' })
          .where('"projectId" = :projectId', { projectId })
          .andWhere('"order" >= :newOrder', { newOrder })
          .andWhere('"order" < :currentOrder', { currentOrder })
          .execute();

        // Phase B: normalize to net +1
        await runner.manager
          .createQueryBuilder()
          .update(Step)
          .set({ order: () => '"order" - 999' })
          .where('"projectId" = :projectId', { projectId })
          .andWhere('"order" >= :newOrder + 1000', { newOrder })
          .andWhere('"order" < :currentOrder + 1000', { currentOrder })
          .execute();
      } else {
        // Phase A: pull below the floor
        await runner.manager
          .createQueryBuilder()
          .update(Step)
          .set({ order: () => '"order" - 1000' })
          .where('"projectId" = :projectId', { projectId })
          .andWhere('"order" > :currentOrder', { currentOrder })
          .andWhere('"order" <= :newOrder', { newOrder })
          .execute();

        // Phase B: normalize to net -1
        await runner.manager
          .createQueryBuilder()
          .update(Step)
          .set({ order: () => '"order" + 999' })
          .where('"projectId" = :projectId', { projectId })
          .andWhere('"order" > :currentOrder - 1000', { currentOrder })
          .andWhere('"order" <= :newOrder - 1000', { newOrder })
          .execute();
      }

      /** 6) Place the parked target into its final slot */
      await runner.manager
        .createQueryBuilder()
        .update(Step)
        .set({ order: newOrder })
        .where('id = :stepId', { stepId })
        .execute();

      /** 7) Commit and return fresh list (you can keep your current find, or use runner.manager) */
      await runner.commitTransaction();
      return this.steps.find({
        where: { project: { id: projectId } },
        order: { order: 'ASC' },
      });
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
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
