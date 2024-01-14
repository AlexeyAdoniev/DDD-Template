import http from 'node:http';
//import ws from 'ws';

import WorkerPool from './workers.js';
import { Transport, HttpTransport } from './transport.js';

class Client {
  /**
   * @type {Transport} transport
   */
  #transport;

  /**
   * @param {Transport} transport
   */
  static create(transport) {
    return new Client(transport);
  }

  constructor(transport) {
    this.#transport = transport;
  }

  send(data, code = 200) {
    this.#transport.send(data, code);
  }

  error(code = 500, message = '') {
    this.#transport.error(code, message);
  }
}

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
        const transport = HttpTransport.create(this, req, res);
        const client = Client.create(transport);

        const data = await this.parseBody(req).catch((e) => console.log(e));

        this.rpc(client, data);

        req.on('close', () => {});
      })
      .listen(port, () => {
        console.log(`listening on port ${port}`);
      });
  }

  /**
   * @param {Client} client
   * @param {Object} data
   */
  rpc(client, data) {
    const { params, id } = data;
    let { method } = data;
    if (!params || !method) {
      return void client.error(400, `Request structure is violated`);
    }
    method = data.method.split('/').join('.');

    const procedure = this.application.get(method);

    if (!procedure) {
      return void client.error(404, `Method no found`);
    }

    procedure(...params).then((res) => {
      client.send(res);
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
export { Server };
//const application = this.application;
// const {method:httpMethod, url} = req
// const [entity, method, id] = url.slice(1).split('/');
// if (!application[entity]) return void res.end('not found');
// const handler = application[entity][method || httpMethod];
// //const entity = application[]
