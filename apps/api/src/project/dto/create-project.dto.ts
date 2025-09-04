// ./apps/api/src/project/dto/create-project.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Human-readable project title',
    example: 'AI Blueprint Mentor',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    description: 'Short description of the project purpose/scope',
    example:
      'A tool that generates a project blueprint and guides step-by-step.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
