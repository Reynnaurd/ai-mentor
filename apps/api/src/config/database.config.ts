//./apps/api/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig: TypeOrmModuleOptions & DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'], // Path to migrations
  migrationsTableName: 'migrations', // Optional: custom table name
  synchronize: false, // Set true only for development
  logging: true,
};
