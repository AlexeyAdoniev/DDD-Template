const table = services.utils.getTableName(__filename);
({
  async get(id, fields) {
    return await services.db(table).read(id, fields);
  },
  async post(record) {
    return await services.db(table).create(record);
  },
  async put(id, record) {
    return await services.db(table).update(id, record);
  },
  async delete(id) {
    return await services.db(table).delete(id);
  },
});
