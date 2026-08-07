/**
 * Database Migration Script
 * Run with: node migrate.js
 * Safely adds missing columns to existing tables without data loss.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const run = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'student_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    const migrations = [
      // Users table - refresh token & firebase_uid support
      { sql: "ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) DEFAULT NULL", name: 'users.firebase_uid' },
      { sql: "ALTER TABLE users ADD COLUMN refresh_token TEXT DEFAULT NULL", name: 'users.refresh_token' },
      { sql: "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL", name: 'users.reset_token' },
      { sql: "ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL", name: 'users.reset_token_expiry' },
      // Students table - firebase_uid & photo URL support
      { sql: "ALTER TABLE students ADD COLUMN firebase_uid VARCHAR(255) DEFAULT NULL", name: 'students.firebase_uid' },
      { sql: "ALTER TABLE students ADD COLUMN photo_url VARCHAR(500) DEFAULT NULL", name: 'students.photo_url' },
    ];

    for (const m of migrations) {
      try {
        await connection.execute(m.sql);
        console.log(`  ✅ Added column: ${m.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ℹ️  Column already exists: ${m.name} (skipped)`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n🎉 Migration complete! All columns are up to date.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

run();
