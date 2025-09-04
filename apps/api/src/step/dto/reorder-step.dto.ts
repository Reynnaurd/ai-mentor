//./apps/api/src/step/dto/reorder-step.dto.ts
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderStepDto {
  @ApiProperty({ description: '1-based order', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  order: number;
}
