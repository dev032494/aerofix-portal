'use strict';

const { literal } = require('sequelize');

const { Logbook, WorkOrder } = require('../models');

// Create a new logbook entry
const createLogbook = async (req, res) => {
  try {
    const { work_order_ref, aircraft_id, date, instructor, student, pilot_entries, aircraft_monitoring, fuel_oil, defects, component_changes, post_flight_signoff } = req.body;
    const work_order_id = work_order_ref;
    const details = JSON.stringify(req.body);
    
    if (!work_order_id || !details) {
      return res.status(400).json({
        success: false,
        message: 'work_order_id and details are required fields.'
      });
    }

    const logbook = await Logbook.create({
      work_order_id,
      details,
    });

    return res.status(201).json({
      success: true,
      message: 'Logbook entry created successfully.',
      data: logbook
    });
  } catch (error) {
    console.error('Error creating logbook entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create logbook entry.',
      error: error.message
    });
  }
};

// Get all logbook entries (with optional filtering by work_order_id)
const getAllLogbooks = async (req, res) => {
  try {
    const { work_order_id } = req.query;
    const queryOptions = {
      include: [
        {
          model: WorkOrder,
          as: 'workOrder'
        },
      ],
      order: [['created_at', 'DESC']]
    };

    if (work_order_id) {
      queryOptions.where = { work_order_id };
    }

    const logbooks = await Logbook.findAll(queryOptions);

    return res.status(200).json({
      success: true,
      count: logbooks.length,
      data: logbooks
    });
  } catch (error) {
    console.error('Error fetching logbook entries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logbook entries.',
      error: error.message
    });
  }
};

// Get all work orders that do not have a logbook yet
const l = async (req, res) => {
  try {
    const workOrders = await WorkOrder.findAll({
      where: literal(`wo_work_order_number NOT IN (SELECT work_order_id FROM logbooks WHERE work_order_id IS NOT NULL)`),
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: workOrders.length,
      data: workOrders
    });
  } catch (error) {
    console.error('Error fetching work orders without logbooks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch work orders without logbooks.',
      error: error.message
    });
  }
};

// Get a single logbook entry by ID
const getLogbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const logbook = await Logbook.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: 'workOrder'
        }
      ]
    });

    if (!logbook) {
      return res.status(404).json({
        success: false,
        message: 'Logbook entry not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: logbook
    });
  } catch (error) {
    console.error('Error fetching logbook entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logbook entry.',
      error: error.message
    });
  }
};

// Update an existing logbook entry
const updateLogbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { work_order_id, details, status } = req.body;

    const logbook = await Logbook.findByPk(id);

    if (!logbook) {
      return res.status(404).json({
        success: false,
        message: 'Logbook entry not found.'
      });
    }

    await logbook.update({
      work_order_id: work_order_id !== undefined ? work_order_id : logbook.work_order_id,
      details: details !== undefined ? details : logbook.details,
      status: status !== undefined ? status : logbook.status
    });

    return res.status(200).json({
      success: true,
      message: 'Logbook entry updated successfully.',
      data: logbook
    });
  } catch (error) {
    console.error('Error updating logbook entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update logbook entry.',
      error: error.message
    });
  }
};

// Delete a logbook entry
const deleteLogbook = async (req, res) => {
  try {
    const { id } = req.params;
    const logbook = await Logbook.findByPk(id);

    if (!logbook) {
      return res.status(404).json({
        success: false,
        message: 'Logbook entry not found.'
      });
    }

    await logbook.destroy();

    return res.status(200).json({
      success: true,
      message: 'Logbook entry deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting logbook entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete logbook entry.',
      error: error.message
    });
  }
};

module.exports = {
  createLogbook,
  getAllLogbooks,
  getLogbookById,
  updateLogbook,
  deleteLogbook
};