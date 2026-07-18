'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '../config/config.js'))[env];
const db = {};

if (!config) {
  throw new Error(`🚨 Database configuration for environment [${env}] was not found inside config.js`);
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// =========================================================================
// 1. EXPLICITLY REQUIRE AND INITIALIZE MODELS IN DEPENDENCY ORDER
// =========================================================================
const modelFactories = [
  require('./user'),
  require('./aircraft'),
  require('./engine'),
  require('./logbookEntry'),
  require('./recurringInspection'),
  require('./adCompliance'),
  require('./workOrder'),
  require('./taskCard'),
  require('./taskCardPart'),
  require('./taskCardStep'),
  require('./documents'),
  require('./revision')
];

// Initialize each model instance and store it inside the db map context
modelFactories.forEach((initModel) => {
  if (typeof initModel === 'function') {
    const model = initModel(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }
});

// =========================================================================
// 2. RUN ASSOCIATIONS LOOP (Guaranteed to have all models loaded in memory)
// =========================================================================
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Print validation manifest map log to terminal window on boot to verify health
console.log('✅ [Sequelize Registry] Loaded Models Cluster:', Object.keys(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;