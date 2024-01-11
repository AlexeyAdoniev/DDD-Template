import { IncomingMessage, ServerResponse } from 'node:http';

class Transport {
  /**
   * @param {any} server
   * @param {IncomingMessage} req
   */
  constructor(server, req) {
    this.server = server;
    this.req = req;
    this.ip = req.socket.remoteAddress;
  }

  write(...args) {
    console.log(args);
    throw new Error('write not impelented in Transport successor');
  }

  /**
   * @param {number } code
   *  @param {Object } data
   */
  error(code, data) {
    code = 500;
    this.send(data, code);
  }

  send(data, code = 200) {
    const json = JSON.stringify(data);
    this.write(json, code);
  }
}

class HttpTransport extends Transport {
  /**
   * @param {any} server
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  constructor(server, req, res) {
    super(server, req);
    this.res = res;
  }

  /**
   * @param {string } data
   * @param {number } code
   */
  write(data, code) {
    this.res.statusCode = code;
    this.res.end(data);
  }
}

export default {
  http: (server, req, res) => new HttpTransport(server, req, res),
};
export { Transport };
