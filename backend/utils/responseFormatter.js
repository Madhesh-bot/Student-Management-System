/**
 * Standard API Response Formatter
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200, meta = undefined) => {
  const responsePayload = {
    success: true,
    message,
    ...(data !== null && data !== undefined && { data }),
    ...(meta !== undefined && { meta })
  };
  return res.status(statusCode).json(responsePayload);
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse
};
