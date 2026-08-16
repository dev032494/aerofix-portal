// controllers/WorkOrderController.js
const workOrderRepository = require('../repositories/workOrderRepository');

exports.getAllWorkOrders = async (req, res) => {
    try {
        const data = await workOrderRepository.findAll();
        console.log(data);
        
        res.status(200).json(data);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

exports.createWorkOrder = async (req, res) => {
    try {
        const { workorder, personnel, items } = req.body;

        console.log(req.body);

        const record = await workOrderRepository.createWithDetails(workorder, personnel, items)

        return res.status(200).json({ success: true, data: record });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }
}

exports.getWorkOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await workOrderRepository.findByWorkOrderNumberWithDetails(id)
        return res.status(200).json({ success: true, data: record });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }
}