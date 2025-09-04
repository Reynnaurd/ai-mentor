//./apps/api/src/step/step.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  HttpCode,
} from '@nestjs/common';
import { StepService } from './step.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ListStepsQuery } from './dto/list-steps.query';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('steps')
@Controller('projects/:projectId/steps')
export class StepController {
  constructor(private readonly service: StepService) {}

  @Post()
  create(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Body() dto: CreateStepDto,
  ) {
    return this.service.create(projectId, dto);
  }

  @Get()
  @ApiQuery({ name: 'orderBy', enum: ['order', 'createdAt'], required: false })
  findAll(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Query() query: ListStepsQuery, //optional
  ) {
    return this.service.findAll(projectId, { orderBy: query.orderBy });
  }

  @Get(':id')
  findOne(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.service.findOne(projectId, id);
  }

  @Patch(':id')
  update(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStepDto,
  ) {
    return this.service.update(projectId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.service.remove(projectId, id);
  }
}
