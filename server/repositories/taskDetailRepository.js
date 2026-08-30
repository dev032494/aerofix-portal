const db = require('../models');
const BaseRepository = require('./baseRepository');

class TaskDetailRepository extends BaseRepository {
    constructor() {
        super(db.TaskDetail);
    }

    async findById(id) {
        return await super.findById(id, { include: ['taskItems'] });
    }

    async findAll() {
        return await super.findAll();
    }

    async findByName(name) {
        return await super.findOne({ where: { td_name: name } });
    }

    async create(data) {
        try {
            const record = await super.create(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message || 'Error creating task detail' };
        }
    }
    
    async update(id, data) {
        try {
            const record = await super.findById(id);
            if (!record) return { success: false, message: 'Task detail not found' };

            await record.update(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async delete(id) {
        try {
            const record = await super.findById(id);
            if (!record) return { success: false, message: 'Task detail not found' };

            await record.destroy();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
module.exports = new TaskDetailRepository();