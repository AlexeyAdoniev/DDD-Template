import { CONFIG } from './config/index.js';

import { tableNameToId } from './lib/utils.js';

import pg from 'pg';

const pool = new pg.Pool({
  host: CONFIG.DB_HOST,
  port: CONFIG.DB_PORT,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB,
  user: CONFIG.DB_USER,
});

function parseRecord(record) {
  const fields = Object.keys(record)
    .map((k) => `"${k}"`)
    .join(',');

  const data = Object.values(record);
  const values = data.map((_, idx) => `$${idx + 1}`).join(',');
  return {
    fields,
    values,
    data,
  };
}

/**
 * @type {typeof services.db}
 */
export default (table) => ({
  async read(id, fields = ['*']) {
    const colums = fields.join(',');
    const sql = `select ${colums} from "${table}"`;
    return !id
      ? await pool.query(sql)
      : await pool.query(`${sql} where "${tableNameToId(table)}"=$1`, [id]);
  },
  async create({ ...record }) {
    const { fields, values, data } = parseRecord(record);
    const sql = `insert into "${table}" (${fields}) values (${values})`;
    return await pool.query(sql, data);
  },

  async update(id, { ...record }) {
    const { fields, data } = parseRecord(record);
    const delta = fields
      .split(',')
      .reduce((acc, cur, idx) => acc + `${cur} = $${idx + 2},`, '')
      .slice(0, -1);

    const sql = `update "${table}" set ${delta}
    where "${tableNameToId(table)}"=$1`;
    return await pool.query(sql, [id, ...data]);
  },
  /**
   * @param {string | number} id
   */
  async delete(id) {
    return await pool.query(
      `DELETE FROM "${table}" WHERE "${tableNameToId(table)}"=$1`,
      [id],
    );
  },
});
