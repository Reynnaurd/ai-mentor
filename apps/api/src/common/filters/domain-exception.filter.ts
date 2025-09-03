// ./apps/api/src/common/filters/domain-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ProjectNotFoundError,
  StepNotFoundError,
  DuplicateStepOrderError,
} from '../errors';

//Services throw domain errors; the filter turns them into consistent HTTP responses.

@Catch() // catch all, then map selectively
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let http: HttpException;

    if (exception instanceof ProjectNotFoundError) {
      http = new NotFoundException({
        code: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        details: { id: exception.id },
      });
    } else if (exception instanceof StepNotFoundError) {
      http = new NotFoundException({
        code: 'STEP_NOT_FOUND',
        message: 'Step not found',
        details: { id: exception.id, projectId: exception.projectId },
      });
    } else if (exception instanceof DuplicateStepOrderError) {
      http = new ConflictException({
        code: 'DUPLICATE_STEP_ORDER',
        message: 'Order must be unique within a project',
        details: { projectId: exception.projectId, order: exception.order },
      });
    } else if (exception instanceof HttpException) {
      http = exception; // let Nest exceptions pass through
    } else {
      http = new InternalServerErrorException({
        code: 'INTERNAL_ERROR',
        message: 'Unexpected error',
      });
    }

    const status = http.getStatus();
    const raw = http.getResponse(); // string | object

    // Normalize the body without using any-typed access
    let body: Record<string, unknown>;
    if (typeof raw === 'string') {
      body = { code: 'HTTP_ERROR', message: raw };
    } else if (raw && typeof raw === 'object') {
      body = raw as Record<string, unknown>;
    } else {
      body = { message: String(raw) };
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...body,
    });
  }
}
