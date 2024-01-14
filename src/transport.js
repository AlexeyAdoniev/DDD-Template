const MIME_TYPES = {
  html: 'text/html; charset=UTF-8',
  json: 'application/json; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

class Transport {
  /**
   * @type {UserTypes.TransportFactory}
   */
  constructor(server, req) {
    this.server = server;
    this.req = req;
  }

  write(..._) {
    _;
    throw new Error('write method is not implemented');
  }

  send(json, code) {
    const data = JSON.stringify(json);
    this.write(data, code, 'json');
  }

  error(code, message) {
    this.write(message, code, 'json');
  }
}

class HttpTransport extends Transport {
  /**
   * @type {UserTypes.HttpTransportFactory}
   */
  static create(server, req, res) {
    return new HttpTransport(server, req, res);
  }

  /**
   * @type {UserTypes.HttpTransportFactory}
   */
  constructor(server, req, res) {
    super(server, req);
    this.res = res;
  }

  write(data, code, ext) {
    if (this.res.writableEnded) return;
    const mimeType = MIME_TYPES[ext];
    this.res.writeHead(code, { ...HEADERS, 'Content-type': mimeType });
    this.res.end(data);
  }
}

export { Transport, HttpTransport };
