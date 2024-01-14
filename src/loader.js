import path from 'node:path';
import fs from 'node:fs/promises';

import { Script, createContext } from 'node:vm';
//import { inspect } from 'node:util';
import { getTableName } from './utils.js';

const DEFAULT_SERVICES = {
  console,
  fetch,
};

const API_PATH = path.join(process.cwd(), '/api');

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

async function load(filePath, container) {
  const code = await fs.readFile(filePath, 'utf-8');
  const script = new Script(`'use strict';\n${code}`);
  const context = createContext(container);
  return script.runInContext(context, CONTEXT_OPTIONS);
}

/**
 * loads app's domain logic in memory and created collection of refs to it
 * @param {UserTypes.ContainerFactory} containerFactory
 * @return {Promise<any>}
 */
async function AppLoader(containerFactory) {
  async function createApplication(dir = '', domain = {}) {
    const root = path.join(API_PATH, dir);
    const files = await fs.readdir(root);
    for (const file of files) {
      const filePath = path.join(root, file);
      const stat = await fs.lstat(filePath);

      if (stat.isFile() && !file.endsWith('.js')) continue;

      const key = file.replace(/\.js$/, '');

      if (stat.isFile()) {
        domain[key] = await load(
          filePath,
          containerFactory.addService({ table: getTableName(key) }).get(),
        );
      } else {
        domain[key] = await createApplication(path.join(dir, key));
      }
    }
    return domain;
  }

  const application = await createApplication();
  return createRouting(application);
}

//recursivly create routing from domain collection
function createRouting(domain, path = '', routes = new Map()) {
  for (const [key, value] of Object.entries(domain)) {
    const subpath = (path + '.' + key).replace(/^\./, '');
    if (typeof value === 'function') {
      routes.set(subpath, value);
    } else {
      createRouting(value, subpath, routes);
    }
  }

  return routes;
}

export { Container, AppLoader, createRouting };
