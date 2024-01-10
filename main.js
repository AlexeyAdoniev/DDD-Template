import { cpus } from 'node:os';
import { CONFIG } from './config/index.js';

import WorkerPool from './src/workers.js';

import db from './src/crud.js';

import { Container, AppLoader } from './src/loader.js';
import Server from './src/server.js';

const { PORT, CONCURRENCY } = CONFIG;

if (CONCURRENCY) {
  const workerNumber = Math.ceil(cpus().length / 2);
  //prepare some worker threads
  WorkerPool(workerNumber);
}

(async () => {
  //prepare application services
  const containerFactory = Container({ db, utils: {} });
  //load application code and inject services
  const application = await AppLoader(containerFactory);
  //start http and ws server
  Server(application, PORT);
})();
