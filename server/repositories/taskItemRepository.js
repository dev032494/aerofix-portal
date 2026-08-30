const db = require('../models');

class TaskItemRepository {
    constructor() {
        this.model = db.TaskItem;
    }

    async findById(id) {
        return await this.model.findByPk(id);
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findByTaskDetailId(id) {
        return await this.model.findAll({ where: { ti_task_detail_id: id } });
    }

    async create(data) {
        try {
            const record = await this.model.create(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message || 'Error creating task item' };
        }
    }

    async update(id, data) {
        try {
            const record = await this.model.findByPk(id);
            if (!record) return { success: false, message: 'Task item not found' };

            await record.update(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async delete(id) {
        try {
            const record = await this.model.findByPk(id);
            if (!record) return { success: false, message: 'Task item not found' };

            await record.destroy();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new TaskItemRepository();