const auditModel = require('../models/auditModel');
const { successResponse } = require('../utils/responseFormatter');

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, entity } = req.query;
    const result = await auditModel.getLogs({ page, limit, entity });
    return successResponse(res, 'Audit logs retrieved', result.logs, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
