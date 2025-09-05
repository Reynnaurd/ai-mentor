//./apps/api/src/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectNotFoundError } from '../common/errors';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const entity = this.projects.create(dto);
    return this.projects.save(entity);
  }

  async findAll(): Promise<Project[]> {
    return this.projects.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projects
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.steps', 's')
      .where('p.id = :id', { id })
      .orderBy('s.order', 'ASC')
      .getOne();

    if (!project) {
      throw new ProjectNotFoundError(id);
    }
    return project;
  }
  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const entity = await this.projects.preload({ ...dto, id });
    // Usually UpdateProjectDto doesn’t include id; chose { ...dto, id } instead of { id, ...dto } to protect the path param => id wins if both exist

    if (!entity) throw new ProjectNotFoundError(id);
    return this.projects.save(entity);
  }

  async remove(id: string): Promise<void> {
    const res = await this.projects.delete(id);
    if (!res.affected) throw new ProjectNotFoundError(id);
    // Controller will return 204; here just finish.
  }
}
