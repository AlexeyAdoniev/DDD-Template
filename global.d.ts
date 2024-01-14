import { globalAgent, IncomingMessage, ServerResponse } from 'node:http';
import pg from 'pg';

import { Server } from './src/server';

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
    type Application = Map<string, (...args: any) => Promise<pg.QueryArrayResult<any>>>;
    type TransportFactory = {
      (server: Server, req: IncomingMessage): any;
    };

    type HttpTransportFactory = {
      (server: Server, req: IncomingMessage, res: ServerResponse): any;
    };
  }
  const services: Services = {};
}
