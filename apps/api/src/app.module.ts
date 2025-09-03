//./apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ProjectModule } from './project/project.module';
import { StepModule } from './step/step.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    ProjectModule,
    StepModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
