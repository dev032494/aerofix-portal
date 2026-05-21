const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
require('dotenv').config();

// Extract environment configuration variables
const env = process.env.NODE_ENV || 'development';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'aerofix';

async function resetDatabasePipeline() {
  // Defensive validation: prevent accidentally wiping live server assets
  if (env.toLowerCase() === 'production' || env.toLowerCase() === 'prod') {
    console.error('\n🚨 [CRITICAL ALERT] Database reset was aborted. You cannot run a db:reset inside a Production environment!');
    process.exit(1);
  }

  console.log(`\n================⚠️  WARNING: RESETTING DATABASE [${env.toUpperCase()}] ================`);
  console.log(`This will wipe out all schemas, tables, and records inside "${dbName}".`);

  try {
    // 1. Establish connection to the engine instance
    console.log(`\nConnecting to MySQL Server instance at ${dbHost}:${dbPort}...`);
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    // 2. Clear out the database container entirely
    console.log(`Purging database schema "${dbName}"...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    console.log(`💥 Database "${dbName}" successfully destroyed.`);
    
    // Disconnect the initial server channel
    await connection.end();

    // 3. Delegate to your existing initialization script to recreate, migrate, and seed
    console.log('\nHanding over pipeline execution to db:init...');
    execSync('npm run db:init', { stdio: 'inherit' });

    console.log(`\n================ 🎉 DATABASE RESET PIPELINE COMPLETE ================浇\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n🚨 [CRITICAL ERROR] Database reset pipeline snapped:');
    console.error(error.message);
    process.exit(1);
  }
}

// Fire execution pipeline
resetDatabasePipeline();