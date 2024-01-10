({
  async get(id, fields) {
    return await services.db(this.talbe).read(id, fields);
  },
  async post(record) {
    return await services.db(this.talbe).create(record);
  },
  async put(id, record) {
    return await services.db(this.talbe).update(id, record);
  },
  async delete(id) {
    return await services.db(this.talbe).delete(id);
  },
});
