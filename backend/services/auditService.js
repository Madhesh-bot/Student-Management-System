const db = require('../config/db');

/**
 * Log user action into audit_logs table
 */
const logAction = async ({ userId = null, action, entity, entityId = null, oldValues = null, newValues = null, ipAddress = null }) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entity,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress
      ]
    );
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

module.exports = {
  logAction
};
