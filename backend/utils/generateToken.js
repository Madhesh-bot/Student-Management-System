const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate a JWT access token containing user info
 * @param {object} user - User details (id, role, name, email)
 * @returns {string} - Signed JWT string
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      name: user.name, 
      email: user.email 
    },
    process.env.JWT_SECRET || 'fallback_secret_key_12345',
    {
      expiresIn: '15m' // Short lived access token (15 mins)
    }
  );
};

/**
 * Generate a JWT refresh token
 * @param {object} user - User details (id)
 * @returns {string} - Signed JWT string
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_54321',
    {
      expiresIn: '7d' // Long lived refresh token (7 days)
    }
  );
};

generateToken.generateRefreshToken = generateRefreshToken;

module.exports = generateToken;
