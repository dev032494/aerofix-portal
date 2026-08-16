// repositories/WorkOrderRepository.js
const { randomUUID } = require('crypto');
const db = require('../models');
const BaseRepository = require('./baseRepository');

class WorkOrderRepository extends BaseRepository {
  constructor() {
    super(db.WorkOrder);
  }

  // Override or extend findAll to include related data and their descriptions/names
  async findAll() {
    return await super.findAll({
      order: [['wo_work_order_number', 'DESC']], // Sorting by newest first
      include: [
        // 1. Fetch the Instructor's User Details
        {
          model: db.User,
          as: 'instructor',
          foreignKey: 'wo_instructor',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
        // 2. Fetch the Approver's User Details
        {
          model: db.User,
          as: 'approver',
          foreignKey: 'wo_approve_by',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
      
      ]
    });
  }

  // View specific work order details using the custom Work Order Number
  async findByWorkOrderNumberWithDetails(workOrderNumber) {
    return await super.findOne({
      where: {
        wo_work_order_number: workOrderNumber
      },
      include: [
        // 1. Fetch the Instructor's User Details
        {
          model: db.User,
          as: 'instructor',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
        // 2. Fetch the Approver's User Details
        {
          model: db.User,
          as: 'approver',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
        // 3. Fetch the Personnel (Students) and their User Details
        {
          model: db.WorkOrderPersonnel,
          as: 'personnel',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['first_name', 'middle_name', 'last_name']
            }
          ]
        },
        // 4. Fetch the Items and their Descriptions
        {
          model: db.WorkOrderItem,
          as: 'items',
          include: [
            {
              model: db.WorkOrderList,
              as: 'workOrderListDetails',
              attributes: ['wol_description']
            }
          ]
        }
      ]
    });
  }

  // Complex creation handling multiple tables with a transaction
  // FIX: Added "= {}" to workOrderData to guarantee it is always an object
  async createWithDetails(workOrderData = {}, personnelList = [], itemsList = []) {
    // Start a managed transaction using the sequelize instance from db
    const transaction = await db.sequelize.transaction();

    try {
      // 1. Generate the Custom Work Order Number safely
      // Since wo_id is auto-incrementing, we can reliably use it to find the latest record
      const lastWorkOrder = await super.findOne({
        order: [['wo_work_order_number', 'DESC']],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      console.log(lastWorkOrder);

      // Default to 1 (This handles the scenario where NO work orders exist yet)
      let nextNumber = 1;

      if (lastWorkOrder?.wo_work_order_number) {
        console.log(lastWorkOrder.wo_work_order_number)
        // Extract the number part from the latest work order and increment
        const [, lastNumberString] = lastWorkOrder.wo_work_order_number.split('-');
        if (lastNumberString) {
          nextNumber = parseInt(lastNumberString, 10) + 1;
        }
      }

      // Format the number to have an 8-digit pad (e.g., WO-00000001)
      workOrderData.wo_work_order_number = `WO-${String(nextNumber).padStart(8, '0')}`;

      // 2. Generate and set the wo_date (yyyy-mm-dd HH:mm)
      const now = new Date();
      const pad = (num) => String(num).padStart(2, '0');

      workOrderData.wo_date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;


      // 3. Create the base Work Order
      // The database will automatically generate and return the auto-incrementing wo_id
      const workOrder = await super.create(workOrderData, { transaction });

      // 4. Prepare and bulk create Personnel
      if (personnelList.length > 0) {
        const personnelData = personnelList.map(userId => ({
          wop_id: randomUUID(),
          wop_work_order_id: workOrder.wo_id, // Sequelize automatically populates this from the create step
          wop_user_id: userId
        }));
        console.log('Executing List Personels')
        await db.WorkOrderPersonnel.bulkCreate(personnelData, { transaction });
      }

      // 5. Prepare and bulk create Items
      if (itemsList.length > 0) {
        const itemsData = itemsList.map(listId => ({
          woi_id: randomUUID(),
          woi_work_order_id: workOrder.wo_id,
          woi_work_order_list_id: listId
        }));
        console.log('Executing List Items')
        await db.WorkOrderItem.bulkCreate(itemsData, { transaction });
      }

      // Fetch and return the newly created record with all its relationships included
      return  await transaction.commit();

    } catch (error) {
      // Rollback completely if any step fails
      console.error("Error creating Work Order with details:", error.message);
      await transaction.rollback();
      throw error;
    }
  }

}

module.exports = new WorkOrderRepository();