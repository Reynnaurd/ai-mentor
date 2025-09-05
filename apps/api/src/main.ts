//./apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { Application as ExpressApp } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.WEB_ORIGIN || true, // tighten later in prod
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }, // Numeric query/param values convert automatically
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Blueprint Mentor API')
      .setDescription('REST API for projects and steps')
      .setVersion('1.0')
      .addServer('http://localhost:4000')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    // Optional raw JSON at /docs-json:
    // Typed /docs-json for Express to satisfy ESLint & TS
    if (app.getHttpAdapter().getType() === 'express') {
      const httpApp = app.getHttpAdapter().getInstance() as ExpressApp;
      httpApp.get('/docs-json', (_req: Request, res: Response) => {
        res.json(document);
      });
    }
  }

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
