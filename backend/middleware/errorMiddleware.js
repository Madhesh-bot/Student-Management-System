const { errorResponse } = require('../utils/responseFormatter');

// Fallback 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Centralized Database Error Processing
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        statusCode = 400;
        message = 'A record with this information already exists in the system.';
        break;
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        statusCode = 400;
        message = 'Referenced entity does not exist in the database.';
        break;
      case 'ER_ROW_IS_REFERENCED_2':
        statusCode = 400;
        message = 'Cannot delete or update this record as it is referenced by other records.';
        break;
      case 'ER_BAD_NULL_ERROR':
        statusCode = 400;
        message = 'A required database field cannot be null.';
        break;
      case 'ER_DATA_TOO_LONG':
        statusCode = 400;
        message = 'Provided text value exceeds maximum database column size.';
        break;
      default:
        console.error(`[Database Error Code ${err.code}]:`, err.message);
    }
  }

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

module.exports = {
  notFound,
  errorHandler
};

