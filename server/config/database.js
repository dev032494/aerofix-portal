const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '#Ebedaf19dd0d',
  database: process.env.DB_NAME || 'aerofix',
  waitForConnections: true,
  connectionLimit: 10, // Maximum concurrent open connections
  queueLimit: 0
});

// Helper to execute raw queries safely
const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params); // .execute uses prepared statements automatically!
  return results;
};

module.exports = { pool, query };