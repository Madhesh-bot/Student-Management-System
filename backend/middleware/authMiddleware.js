const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Protect routes - Verifies JWT Bearer Token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'production_ready_secret_key_987654321');

    // Fetch active user with joined role
    const users = await db.query(
      `SELECT u.id, u.name, u.email, u.role_id, r.role_name AS role, u.is_active 
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return errorResponse(res, 'User profile inactive or no longer exists', 401);
    }

    req.user = users[0];
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token invalid or expired', 401);
  }
};

/**
 * Role-Based Access Control (RBAC) authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`, 403);
    }
    next();
  };
};

const adminOnly = authorize('admin');
const staffOrAdmin = authorize('admin', 'staff');

module.exports = {
  protect,
  authorize,
  adminOnly,
  staffOrAdmin
};
