({
  async get(id, fields) {
    return await services.db(services.table).read(id, fields);
  },
  async post(record) {
    return await services.db(services.table).create(record);
  },
  async put(id, record) {
    return await services.db(services.table).update(id, record);
  },
  async delete(id) {
    return await services.db(services.table).delete(id);
  },
});
