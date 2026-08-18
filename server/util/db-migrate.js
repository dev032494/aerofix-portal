// Load environment variables from your .env file
require('dotenv').config();
const { exec } = require('child_process');

// ANSI Escape Codes for Styling
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runMigrations() {
  console.log(`${BOLD}${GREEN}=== RUNNING PENDING MIGRATIONS ===${RESET}\n`);

  // Run the Sequelize CLI migrate command. 
  // Sequelize automatically creates and checks the SequelizeMeta table for pending files.
  const migrateProcess = exec('npx sequelize-cli db:migrate', { env: process.env }, (error) => {
    if (error) {
      console.error('Error running migrations:', error.message);
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

runMigrations();