// ./apps/api/src/step/dto/update-step.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStepDto } from './create-step.dto';

export class UpdateStepDto extends PartialType(CreateStepDto) {}
// The PartialType function makes all fields in CreateStepDto optional for UpdateStepDto
