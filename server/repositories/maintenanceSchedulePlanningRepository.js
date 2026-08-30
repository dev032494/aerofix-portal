const BaseRepository = require('./baseRepository');
const db = require('../models');

class MaintenanceSchedulePlanningRepository extends BaseRepository {

  constructor() { super(db.MaintenancePlanningSchedule); }

  async findById(id) {
    return await super.findById(id);
  }

  async findAll() {
    return await super.findAll();
  }

  async findByAircraftId(id) {
    return await super.findAll({ where: { mps_aircraft_id: id } });
  }

  async findByTaskDetailId(id) {
    return await super.findAll({ where: { mps_task_detail_id: id } });
  }

  async findByManualDetailId(id) {
    return await super.findAll({ where: { mps_manual_detail_id: id } });
  }

  async create(data) {
    try {
      const record = await super.create(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message || 'Error creating maintenance schedule' };
    }
  }

  async update(id, data) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Maintenance schedule not found' };

      await record.update(data);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async delete(id) {
    try {
      const record = await super.findById(id);
      if (!record) return { success: false, message: 'Maintenance schedule not found' };

      await record.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

}

module.exports = new MaintenanceSchedulePlanningRepository();