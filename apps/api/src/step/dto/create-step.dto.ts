//./apps/api/src/step/dto/create-step.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateStepDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsInt()
  @Min(1)
  order: number;
}
