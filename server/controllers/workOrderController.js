// controllers/WorkOrderController.js
const workOrderRepository = require('../repositories/workOrderRepository');
require('dotenv').config();

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

exports.getCompleteWorkOrders = async (req, res) => {
    try {
        const data = await workOrderRepository.findAllComplete();
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

exports.studentTask = async (req, res) => {
    try {

        const { id } = req.params;
        const record = await workOrderRepository.findAllByPersonnelId(id)
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }
}

exports.startTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { wo_status } = req.body;
        console.log(id, wo_status);

        const record = await workOrderRepository.updateTaskToOngoing(id);
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }

}

exports.reportTask = async (req, res) => {
    try {
        const { id } = req.params; // work order number or ID
        const { wo_status, action_taken, discrepancy, corrective_action } = req.body;

        // Parse JSON strings when sending multipart/form-data
        let parts = [];
        if (req.body.parts) {
            parts = typeof req.body.parts === 'string' ? JSON.parse(req.body.parts) : req.body.parts;
        }

        let captions = [];
        if (req.body.captions) {
            captions = typeof req.body.captions === 'string' ? JSON.parse(req.body.captions) : req.body.captions;
        }

        console.log("Reporting Task ID:", id, "Status:", wo_status);

        // Map uploaded files to public path strings
        const proofFiles = (req.files || []).map((file, index) => ({
            filePath: `${process.env.VITE_DOMAIN}/work_order/${id}/${file.filename}`,
            fileName: file.filename,
            caption: captions[index] || file.originalname,
            uploadedAt: new Date()
        }));

        // Call repository function with all submitted details including proofs
        const record = await workOrderRepository.updateTaskToComplete(
            id,
            action_taken,
            discrepancy,
            corrective_action,
            parts,
            proofFiles
        );

        return res.status(200).json({
            success: true,
            message: "Work order report submitted successfully.",
            data: record,
            proofsAttached: proofFiles.length
        });
    } catch (error) {
        console.error("Error in reportTask controller:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.viewReport = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await workOrderRepository.viewReport(id);

        console.log(record);


        return res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error("Error in viewReport controller:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}