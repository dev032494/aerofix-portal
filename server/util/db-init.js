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

async function initializeDatabasePipeline() {
  console.log(`\n============== 🛠️  STARTING DB INITIALIZATION [${env.toUpperCase()}] ==============`);

  try {
    // 1. Establish connection directly to the MySQL Server engine (WITHOUT selecting a DB layout)
    console.log(`\nConnecting to MySQL Server instance at ${dbHost}:${dbPort}...`);
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    // 2. Create the target schema safely if it doesn't already exist
    console.log(`Ensuring database schema "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✨ Database schema "${dbName}" verified/created successfully.`);
    
    // Close the initial server channel
    await connection.end();

    // 3. Trigger Sequelize-CLI Migrations sequentially
    console.log('\nRunning database migrations...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully.');

    // 4. Trigger Sequelize-CLI Seeders sequentially
    console.log('\nRunning database seeders...');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('✅ Seeders executed successfully.');

    console.log(`\n================ 🎉 DATABASE SETUP COMPLETE ================浇\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n🚨 [CRITICAL ERROR] Database initialization pipeline snapped:');
    console.error(error.message);
    process.exit(1);
  }
}

// Fire execution pipeline
initializeDatabasePipeline();