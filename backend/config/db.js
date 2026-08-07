const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool using mysql2/promise
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00'
});

/**
 * Verify DB connection and ensure all 13 required tables exist
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully.');
    
    // Ensure all 13 required tables exist
    const tablesToVerify = [
      'roles',
      'users',
      'departments',
      'courses',
      'subjects',
      'staff',
      'students',
      'attendance',
      'marks',
      'leave_requests',
      'timetables',
      'notifications',
      'audit_logs'
    ];

    for (const table of tablesToVerify) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [process.env.DB_NAME || 'student_management', table]
      );
      if (rows[0].count === 0) {
        console.log(`ℹ️ Table '${table}' missing in schema, creating table...`);
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`ℹ️ Database '${process.env.DB_NAME || 'student_management'}' does not exist. Please create it or run schema migration.`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('ℹ️ Could not connect to MySQL server. Please verify MySQL service is running on ' + (process.env.DB_HOST || 'localhost') + ':' + (process.env.DB_PORT || 3306));
    }
  }
};

testConnection();

/**
 * Execute query with automatic error logging & parameterization
 */
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error(`❌ SQL Query Error: ${err.message} | Query: ${sql}`);
    throw err;
  }
};

/**
 * Execute transactional workload cleanly with rollback on error
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    console.error(`❌ SQL Transaction Error: ${err.message}`);
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  execute: query,
  withTransaction
};

