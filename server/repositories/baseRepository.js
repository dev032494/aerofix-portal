class BaseRepository {
  constructor(model) {
    // Store it under a different variable name to avoid blocking child getters
    this.internalModel = model;
  }

  // A helper method that always fetches the correct model instance safely
  get currentModel() {
    return this.model || this.internalModel;
  }

  async findAll(options = {}) {
    return await this.currentModel.findAll(options);
  }

  async findById(id, options = {}) {
    return await this.currentModel.findByPk(id, options);
  }

  async create(data, options = {}) {
    return await this.currentModel.create(data, options);
  }

  async update(id, data, options = {}) {
    const record = await this.currentModel.findByPk(id);
    if (!record) return null;
    return await record.update(data, options);
  }

  async delete(id, options = {}) {
    const record = await this.currentModel.findByPk(id);
    if (!record) return false;
    await record.destroy(options);
    return true;
  }
}

module.exports = BaseRepository;