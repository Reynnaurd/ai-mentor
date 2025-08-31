// apps/api/src/config/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';

// Build a DataSource from the same config Nest uses.
// This file is what the TypeORM CLI will read.
const dataSource = new DataSource({
  ...databaseConfig,
  // safety: ensure sync is off for CLI as well
  synchronize: false,
});

export default dataSource;
