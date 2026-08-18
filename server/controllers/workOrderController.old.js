const workOrderRepository = require('../repositories/workOrderRepository');

/**
 * Retrieves the complete high-level ledger of all registered work orders
 */
const getAllWorkOrders = async (req, res, next) => {
  // #swagger.tags = ['Work Orders & Task Cards Operations']
  try {
    const workOrders = await workOrderRepository.findAllSummary();
    res.status(200).json({
      status: 'success',
      data: { workOrders }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpacks nested task cards compliance metrics for a single tracker row
 */
const getWorkOrderProgress = async (req, res, next) => {
  // #swagger.tags = ['Work Orders & Task Cards Operations']
  try {
    const { id } = req.params;
    const workOrder = await workOrderRepository.findProgressTree(id);

    if (!workOrder) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active maintenance work order found matching that index pointer.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { workOrder }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Commits a brand new root level maintenance contract into rows
 */
const createWorkOrder = async (req, res, next) => {
  // #swagger.tags = ['Work Orders & Task Cards Operations']
  try {
    // Expected incoming fields layout matching your frontend parameters fields:
    // { work_order_number: "WO-2026-X", aircraft_id: 1, opened_date: "2026-05-21", status: "open" }
    const workOrder = await workOrderRepository.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { workOrder }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllWorkOrders,
  getWorkOrderProgress,
  createWorkOrder
};