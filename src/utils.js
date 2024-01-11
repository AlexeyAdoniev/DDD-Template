import { IncomingMessage } from 'node:http';
import Workers from './workers.js';

/**
 * @param {IncomingMessage} request
 * @return {Promise}
 */
function readBody(request) {
  return new Promise((resolve, reject) => {
    (async () => {
      const workerPromise = Workers().getWorker();
      const chunks = [];
      request
        .on('data', (chunk) => chunks.push(chunk))
        .on('end', async () => {
          const body = Buffer.concat(chunks).toString();
          const worker = await workerPromise;
          try {
            //no free workers -> execute in current proccess
            if (!worker) resolve(JSON.parse(body));
            const result = await Workers().execute(worker, {
              action: 'parseJSON',
              payload: body,
            });
            Workers().releaseWorker(worker);
            resolve(result);
          } catch {
            worker && Workers().releaseWorker(worker);
            reject('Failed to parse request body');
          }
        })
        .on('error', (err) => {
          console.log(err);
          reject('Failed to read request chunks');
        });
    })();
  });
}
/**
 * @param {string} table
 * @return {string}
 */
function tableNameToId(table) {
  return table[0].toLowerCase() + table.slice(1) + 'Id';
}
/**
 * @param {string} filename
 * * @return {string}
 */
function getTableName(filename) {
  return filename[0].toUpperCase() + filename.slice(1);
}

export { readBody, tableNameToId, getTableName };
