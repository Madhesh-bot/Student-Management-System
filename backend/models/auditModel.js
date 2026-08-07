const db = require('../config/db');

const auditModel = {
  getLogs: async ({ page = 1, limit = 50, entity = null }) => {
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let whereClause = `WHERE 1=1`;

    if (entity) {
      whereClause += ` AND a.entity = ?`;
      params.push(entity);
    }

    const countRows = await db.query(`SELECT COUNT(*) AS total FROM audit_logs a ${whereClause}`, params);

    const logs = await db.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.id DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    return {
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      logs
    };
  }
};

module.exports = auditModel;
