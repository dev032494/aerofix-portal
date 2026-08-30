const maintenanceSchedulePlanningRepository = require('../repositories/maintenanceSchedulePlanningRepository');

exports.createMaintenanceSchedule = async (req, res) => {
    try {
        const record = await maintenanceSchedulePlanningRepository.create(req.body);

        return res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMaintenanceScheduleList = async (req, res) => {
    try {
        const data = await maintenanceSchedulePlanningRepository.findAll();
        res.status(200).json(data);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

exports.getMaintenanceSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await maintenanceSchedulePlanningRepository.findById(id);
        if (!record) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};