import { globalAgent } from 'node:http';
import pg from 'pg';

type dbId = string | number;
type dbRecord = {
  [x: string]: any;
};
type DB = (table: string) => {
  read: (id: dbId, fields: string[]) => Promise<pg.QueryArrayResult<any>>;
  create: (record: dbRecord) => Promise<pg.QueryArrayResult<any>>;
  update: (id: dbId, record: dbRecord) => Promise<pg.QueryArrayResult<any>>;
  delete: (id: dbId) => Promise<pg.QueryArrayResult<any>>;
};

type Utils = {
  getTableName(url: string): string;
};

type Services = {
  utils: Utils;
  db: DB;
};

declare global {
  const services: Services = {};
}
