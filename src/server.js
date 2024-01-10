import http from 'node:http';
//import ws from 'ws';

import WorkerPool from './workers.js';

class Server {
  /**
   * @param {UserTypes.Application} application
   * @param {number } port
   */
  constructor(application, port) {
    this.application = application;
    this.httpServer = http.createServer();
    this.listen(port);
  }
  /**
   * @param {number } port
   */
  listen(port) {
    this.httpServer
      .on('request', async (req, res) => {
        const data = await this.parseBody(req).catch((e) => console.log(e));
        console.log(data);
        res.end('x');
      })
      .listen(port, () => {
        console.log(`listening on port ${port}`);
      });
  }

  /**
   * @param {http.IncomingMessage } req
   */
  parseBody(req) {
    return new Promise((resolve, reject) => {
      (async () => {
        const workerPromise = WorkerPool().getWorker();
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        //console.log(req['Symbol']);
        const body = Buffer.concat(chunks).toString();
        if (!body) return void resolve({});
        const worker = await workerPromise;
        try {
          //no free workers? -> execute in current proccess=
          if (!worker) return void resolve(JSON.parse(body));
          const result = await WorkerPool().execute(worker, {
            action: 'parseJSON',
            payload: body,
          });
          WorkerPool().releaseWorker(worker);
          resolve(result);
        } catch {
          worker && WorkerPool().releaseWorker(worker);
          reject('Failed to parse request body');
        }
      })();
    });
  }
}

export default (application, port) => new Server(application, port);

//const application = this.application;
// const {method:httpMethod, url} = req
// const [entity, method, id] = url.slice(1).split('/');
// if (!application[entity]) return void res.end('not found');
// const handler = application[entity][method || httpMethod];
// //const entity = application[]
