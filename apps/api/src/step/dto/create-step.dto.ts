//./apps/api/src/step/dto/create-step.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({
    description: 'Step title',
    example: 'Set up dev container',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    description: 'Detailed instructions for the step',
    example:
      'Create devcontainer.json and docker-compose for Postgres. Configure volumes.',
  })
  @IsString()
  @IsNotEmpty()
  detail!: string;

  @ApiProperty({
    description: '1-based order of the step within the project',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  order!: number;
}
