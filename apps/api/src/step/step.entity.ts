//./apps/api/src/step/step.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
@Unique(['project', 'order']) // Composite unique constraint
@Index(['project', 'order']) // Composite index for fast reads
export class Step {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  detail: string;

  @Column()
  order: number;

  @ManyToOne(() => Project, (project) => project.steps, { onDelete: 'CASCADE' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
