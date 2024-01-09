import { createServer } from 'node:http';
import { cpus } from 'node:os';

//import { readBody } from './lib/utils.js';
//import WorkerPool from './lib/workers.js';

const PORT = 3000;

const workerNumber = Math.ceil(cpus().length / 2);
//WorkerPool(workerNumber);

createServer((request, response) => {
  const { method, url, headers } = request;
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
 */
  console.log(method, url, headers);

  response.end();
}).listen(PORT, async () => {
  console.log(`running on port on ${PORT} with ${workerNumber} workers`);
});
