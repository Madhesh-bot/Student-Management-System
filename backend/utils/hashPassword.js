const bcrypt = require('bcryptjs');

/**
 * Hash student/user password before saving to the database
 * @param {string} password - Raw text password
 * @returns {Promise<string>} - Hashed password
 */
const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare entered password with stored hashed password
 * @param {string} enteredPassword - Raw text password from request
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - Match comparison result
 */
const compare = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  hash,
  compare
};
