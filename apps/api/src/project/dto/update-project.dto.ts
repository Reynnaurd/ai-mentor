// ./apps/api/src/project/dto/update-project.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
// The PartialType function makes all fields in CreateProjectDto optional for UpdateProjectDto
