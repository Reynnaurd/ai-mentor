// ./apps/api/src/step/dto/list-steps.query.ts
import { IsIn, IsOptional } from 'class-validator';
export class ListStepsQuery {
  @IsOptional()
  @IsIn(['order', 'createdAt'])
  orderBy?: 'order' | 'createdAt';
}
