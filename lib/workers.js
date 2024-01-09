import { Worker, parentPort, isMainThread } from 'node:worker_threads';

class Pool {
  #workers = [];
  #pending = [];

  /**
   * @param {number} size
   */
  constructor(size) {
    for (let i = 0; i < size; i++) {
      this.#workers.push(new Worker(process.cwd() + '/lib/workers.js'));
    }
  }

  /**
   * @param {{waitForRelease?: boolean}} options
   * @returns {Promise<Worker>}
   */
  getWorker(options = {}) {
    return new Promise((resolve) => {
      if (this.#workers.length) {
        return void resolve(this.#workers.shift());
      }

      if (!options.waitForRelease) {
        return void resolve(null);
      }

      this.#pending.push(resolve);
    });
  }

  releaseWorker(worker) {
    if (this.#pending.length) {
      const resolve = this.#pending.shift();
      return void resolve(worker);
    }
    this.#workers.push(worker);
  }

  /**
   * @param {Worker} worker
   * @param {{action:string, payload: any}} task
   */
  execute(worker, task) {
    return new Promise((resolve, reject) => {
      worker.postMessage(task);
      worker.on('message', (result) => resolve(result));
      worker.on('error', (err) => {
        console.log(err, `err from worker ${err.message}`);
        reject(`Worker error: ${task.action}`);
      });
    });
  }
}

let pool;

/**
 * @param {number} size
 * @returns {Pool}
 */
export default (size = 0) => {
  if (!pool) {
    pool = new Pool(size);
  }
  return pool;
};

const tasks = {
  parseJSON: (body) => JSON.parse(body),
};

if (!isMainThread)
  parentPort.on('message', (json) => {
    const task = tasks[json.action];
    if (!task) {
      throw new Error('non existent task');
    }

    const result = task(json.payload);
    parentPort.postMessage(result);
  });
