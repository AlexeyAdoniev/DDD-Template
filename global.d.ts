import { globalAgent } from 'node:http';
import pg from 'pg';

type dbId = string | number;
type dbRecord = {
  [x: string]: any;
};

type Utils = {};

declare global {
  declare namespace UserTypes {
    type DB = (table: string) => {
      read: (id: dbId, fields: string[]) => Promise<pg.QueryArrayResult<any>>;
      create: (record: dbRecord) => Promise<pg.QueryArrayResult<any>>;
      update: (id: dbId, record: dbRecord) => Promise<pg.QueryArrayResult<any>>;
      delete: (id: dbId) => Promise<pg.QueryArrayResult<any>>;
    };
    type AnyField = { [x: string]: any };
    type Services = {
      utils: Utils;
      db: DB;
      table?: string;
    };
    type Container = AnyField & { services: typeof services };
    type ContainerFactory = {
      addService(service: UserTypes.AnyField): UserTypes.ContainerFactory;
      get(): UserTypes.Container;
    };
    type Application = {
      [x: string]: {
        get(): Promise<pg.QueryArrayResult<any>>;
        post(): Promise<pg.QueryArrayResult<any>>;
        put(): Promise<pg.QueryArrayResult<any>>;
        delete(): Promise<pg.QueryArrayResult<any>>;
      };
    };
  }
  const services: Services = {};
}
