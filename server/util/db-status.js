// Load environment variables from your .env file
require('dotenv').config();
const { exec } = require('child_process');

// ANSI Escape Codes for Styling
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function checkMigrationStatus() {
  console.log(`${BOLD}${GREEN}=== MIGRATION STATUS TABLE ===${RESET}\n`);

  // Run the Sequelize CLI status command
  const migrateProcess = exec('npx sequelize-cli db:migrate:status', { env: process.env }, (error) => {
    if (error) {
      console.error('Error fetching migration status:', error.message);
      process.exit(1);
    }
  });

  // Intercept and colorize the stdout output green
  migrateProcess.stdout.on('data', (data) => {
    process.stdout.write(`${GREEN}${data}${RESET}`);
  });

  // Pipe errors normally
  migrateProcess.stderr.pipe(process.stderr);
}

checkMigrationStatus();