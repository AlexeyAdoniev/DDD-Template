import { createServer } from 'node:http';
import { cpus } from 'node:os';

import fs from 'node:fs/promises';
import path from 'node:path';

//import { readBody } from './lib/utils.js';
//import WorkerPool from './lib/workers.js';

import db from './crud.js';

import { Script, createContext } from 'node:vm';

const PORT = 3000;
const CONTEXT_OPTIONS = {
  timeout: 5000,
  displayErrors: false,
};

const workerNumber = Math.ceil(cpus().length / 2);
//WorkerPool(workerNumber);

(async () => {
  const sandbox = {
    /**
     * @type {typeof services}
     */
    services: {
      db,
      utils: {
        getTableName: (filename) =>
          filename[0].toUpperCase() + filename.slice(1),
      },
    },
    URL,
    console,
    fetch,
  };

  const apiPath = path.join(process.cwd(), '/api');
  const files = await fs.readdir(apiPath);
  const routes = {};
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const route = file.replace(/\.js$/, '');
    const code = await fs.readFile(path.join(apiPath, file), 'utf-8');
    const script = new Script(`'use strict';\n${code}`);
    const context = createContext({ __filename: route, ...sandbox });
    routes[route] = script.runInContext(context, CONTEXT_OPTIONS);
  }

  createServer(async (request, response) => {
    const { method: httpMethod, url, headers } = request;
    headers;
    //let body = null;
    /**
     *   if (method === 'POST' || method === 'PUT') {
        readBody(request)
          .then((data) => {
            body = data;
            console.log(body, 'body data');
          })
          .catch((err) => {
            console.log(err);
          });
      }
      console.log(method, url, headers);
      */

    const [name /*, method, id*/] = url.substring(1).split('/');
    const entity = routes[name];
    if (!entity) return void response.end('Not found');
    const handler = entity[httpMethod.toLowerCase()];
    if (!handler) return void response.end('Not found');
    const res = await handler();
    if (!res) {
      response.statusCode = 500;
      response.end('Server error');
    }
    response.end(JSON.stringify(res.rows));
  }).listen(PORT, async () => {
    console.log(`running on port on ${PORT} with ${workerNumber} workers`);
  });
})();
