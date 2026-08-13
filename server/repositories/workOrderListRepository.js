const db = require('../models');
const BaseRepository = require('./BaseRepository');


class WorkOrderRepository extends BaseRepository {
    constructor() {
        super(db.WorkOrderList);
    }


    async findAll() {
        return await super.findAll({ order: [['wol_description', 'ASC']] });
    }

    async findById(id) {
        return await super.findById(id);
    }

    async findByDescription(description) {
        return await super.findOne({ where: { wol_description: description } });
    }

    async create(data) {
        try {
            const record = await super.create(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message || 'Error creating work order' };
        }
    }

    async update(id, data) {
        try {
            const record = await super.findById(id);
            if (!record) return { success: false, message: 'Work order not found' };

            await record.update(data);
            return { success: true, data: record };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async delete(id) {
        try {
            const record = await super.findById(id);
            if (!record) return { success: false, message: 'Work order not found' };

            await record.destroy();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new WorkOrderRepository();