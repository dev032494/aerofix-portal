const db = require('../models');
const BaseRepository = require('./baseRepository');

class ManualItemRepository extends BaseRepository {
  constructor() {
    super(db.ManualItem);
  }

  async findById(id, include) {
    return await super.findById(id, { include });
  }

  async findByManualDetailId(id) {
    return await super.findAll({ where: { mi_manual_detail_id: id } });
  }

  async findAll(include) {
    return await super.findAll({ include });
  }

  async create(data) {
    try {
      const record = await super.create(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message || 'Error creating manual item' };
    }
  }

  async update(id, data) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Manual item not found' };

      await record.update(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async delete(id) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Manual item not found' };

      await record.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
module.exports = new ManualItemRepository();