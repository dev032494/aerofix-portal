const db = require('../models');
const BaseRepository = require('./baseRepository');

class LogbookRepository extends BaseRepository {
  constructor() {
    super(db.FlightLog || db.Logbook);

    // Expose related models so they can be referenced in controller includes
    this.PilotEntry = db.PilotEntry;
    this.AircraftMonitoringLog = db.AircraftMonitoringLog;
    this.FuelOilRecord = db.FuelOilRecord;
    this.MaintenanceDefect = db.MaintenanceDefect;
    this.ComponentChange = db.ComponentChange;
    this.PostFlightSignoff = db.PostFlightSignoff;
  }

  async findAll(options = {}) {
    return await super.findAll({
      order: [['wo_work_order_number', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'instructor',
          foreignKey: 'wo_instructor',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
        {
          model: db.User,
          as: 'approver',
          foreignKey: 'wo_approve_by',
          attributes: ['first_name', 'middle_name', 'last_name']
        },
        ...(options.include || [])
      ],
      ...options
    });
  }

  async createFlightLog(data, options) {
    return await db.FlightLog.create(data, options);
  }

  async createPilotEntry(data, options) {
    return Array.isArray(data)
      ? await db.PilotEntry.bulkCreate(data, options)
      : await db.PilotEntry.create(data, options);
  }

  async createAircraftMonitoringLog(data, options) {
    return Array.isArray(data)
      ? await db.AircraftMonitoringLog.bulkCreate(data, options)
      : await db.AircraftMonitoringLog.create(data, options);
  }

  async createFuelOilRecord(data, options) {
    return await db.FuelOilRecord.create(data, options);
  }

  async createMaintenanceDefect(data, options) {
    return Array.isArray(data)
      ? await db.MaintenanceDefect.bulkCreate(data, options)
      : await db.MaintenanceDefect.create(data, options);
  }

  async createComponentChange(data, options) {
    return Array.isArray(data)
      ? await db.ComponentChange.bulkCreate(data, options)
      : await db.ComponentChange.create(data, options);
  }

  async createPostFlightSignoff(data, options) {
    return await db.PostFlightSignoff.create(data, options);
  }

  async findByPk(id, options = {}) {
    return await db.FlightLog.findByPk(id, options);
  }
}

module.exports = new LogbookRepository();