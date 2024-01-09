import { config } from 'dotenv';
config();

export const CONFIG = {
  DB: process.env['DB'],
  DB_HOST: process.env['DB_HOST'] || '127.0.0.1',
  DB_PORT: Number(process.env['DB_PORT'] || 5432),
  DB_PASSWORD: process.env['DB_PASSWORD'],
  DB_USER: process.env['DB_USER'] || 'postgres',
};
