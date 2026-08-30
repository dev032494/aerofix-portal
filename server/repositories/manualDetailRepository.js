const db = require('../models');
const BaseRepository = require('./baseRepository');

class ManualDetailRepository extends BaseRepository {
  constructor() {
    super(db.ManualDetail);
  }

  async findById(id, include) {
    return await super.findById(id, { include });
  }

  async findByReferenceId(id) {
    return await super.findOne({ where: { md_reference_id: id } });
  }

  async findAll(include) {
    return await super.findAll({ include });
  }

  async create(data) {
    try {
      const record = await super.create(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message || 'Error creating manual detail' };
    }
  }

  async update(id, data) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Manual detail not found' };

      await record.update(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async delete(id) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Manual detail not found' };

      await record.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }


}
module.exports = new ManualDetailRepository();