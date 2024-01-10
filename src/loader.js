import path from 'node:path';
import fs from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { getTableName } from './utils.js';

const DEFAULT_SERVICES = {
  console,
  fetch,
};

const CONTEXT_OPTIONS = {
  timeout: 5000,
  displayErrors: false,
};

/**
 * @param {UserTypes.Services} inject
 * @return { UserTypes.ContainerFactory}
 */
function Container({ ...inject }) {
  let container = {
    ...DEFAULT_SERVICES,
    services: {
      ...inject,
    },
  };

  return {
    get() {
      return container;
    },
    addService(service) {
      container = {
        ...container,
        services: {
          ...container.services,
          ...service,
        },
      };
      return this;
    },
  };
}
/**
 * loads app's routes and handlers in memory
 * @param {UserTypes.ContainerFactory} containerFactory
 * @return {Promise<any>}
 */
async function AppLoader(containerFactory) {
  const apiPath = path.join(process.cwd(), '/api');
  const files = await fs.readdir(apiPath);
  const app = {};
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const route = file.replace(/\.js$/, '');
    const code = await fs.readFile(path.join(apiPath, file), 'utf-8');
    const script = new Script(`'use strict';\n${code}`);
    const container = containerFactory
      .addService({ table: getTableName(route) })
      .get();
    const context = createContext(container);
    app[route] = script.runInContext(context, CONTEXT_OPTIONS);
  }
  return app;
}

export { Container, AppLoader };
