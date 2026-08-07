const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const { hash, compare } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAction } = require('../services/auditService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Register User (Public)
 */
const registerUser = async (req, res, next) => {
  try {
    const { 
      firebase_uid, 
      name, 
      email, 
      password, 
      role = 'staff', 
      register_number, 
      department,
      department_id = 1, 
      year = 1, 
      section = 'A', 
      gender = 'Male', 
      phone, 
      address 
    } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';
    const cleanName = name ? name.trim() : cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanPassword) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Check user exists in MySQL
    const userExists = await userModel.findUserByEmail(cleanEmail);
    if (userExists) {
      return errorResponse(res, 'A user account already exists in MySQL with this email address', 400);
    }

    const hashedPassword = await hash(cleanPassword);
    const newUser = await userModel.createUser({
      firebase_uid,
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role
    });

    if (role === 'student') {
      const cleanRegNum = register_number ? register_number.trim() : null;
      if (!cleanRegNum) {
        return errorResponse(res, 'Register number is required for student registration', 400);
      }
      await studentModel.addStudent({
        user_id: newUser.id,
        firebase_uid,
        register_number: cleanRegNum,
        student_name: cleanName,
        department_id: Number(department_id) || 1,
        year: Number(year) || 1,
        section,
        gender,
        email: cleanEmail,
        phone,
        address
      });
    }

    const token = generateToken(newUser);
    const refreshToken = generateToken.generateRefreshToken(newUser);
    await userModel.updateRefreshToken(newUser.id, refreshToken);

    await logAction({
      userId: newUser.id,
      action: 'USER_REGISTER',
      entity: 'users',
      entityId: newUser.id,
      newValues: { firebase_uid, name: cleanName, email: cleanEmail, role },
      ipAddress: req.ip
    });

    return successResponse(res, 'User registered successfully in MySQL', {
      id: newUser.id,
      firebase_uid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
      refreshToken
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login User (Public)
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password, firebase_uid } = req.body;
    if (!email && !firebase_uid) {
      return errorResponse(res, 'Please provide email/register number or firebase_uid', 400);
    }

    const cleanEmailOrIdentifier = email ? email.trim().toLowerCase() : null;
    const cleanPassword = password ? password.trim() : null;

    let user = null;
    if (firebase_uid) {
      user = await userModel.findUserByFirebaseUid(firebase_uid);
    }
    if (!user && cleanEmailOrIdentifier) {
      user = await userModel.findUserByEmailOrRegisterNumber(cleanEmailOrIdentifier);
    }

    // Auto-create admin123@gmail.com if missing from MySQL DB
    if (!user && cleanEmailOrIdentifier === 'admin123@gmail.com' && cleanPassword === '123456') {
      const hashedPassword = await hash('123456');
      user = await userModel.createUser({
        name: 'Administrator',
        email: 'admin123@gmail.com',
        password: hashedPassword,
        role: 'admin',
        role_id: 1
      });
      user.role = 'admin';
    }

    if (!user) {
      return errorResponse(res, 'User profile not found in database', 404);
    }

    // Verify password if provided
    if (cleanPassword) {
      const isMatch = await compare(cleanPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Invalid credentials provided', 401);
      }
    }

    const token = generateToken(user);
    const refreshToken = generateToken.generateRefreshToken(user);
    await userModel.updateRefreshToken(user.id, refreshToken);

    await logAction({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'users',
      entityId: user.id,
      ipAddress: req.ip
    });

    return successResponse(res, 'Login successful', {
      id: user.id,
      firebase_uid: user.firebase_uid,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token (Public)
 */
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_54321');
    } catch (err) {
      return errorResponse(res, 'Invalid or expired refresh token', 403);
    }

    const user = await userModel.findUserById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User no longer exists', 403);
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = generateToken.generateRefreshToken(user);
    await userModel.updateRefreshToken(user.id, newRefreshToken);

    return successResponse(res, 'Tokens refreshed successfully', {
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password (Public)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email address is required', 400);
    }

    const user = await userModel.findUserByEmailOrRegisterNumber(email);
    if (!user) {
      return errorResponse(res, 'User account not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hr

    await userModel.updateResetToken(user.id, resetToken, expiry);

    return successResponse(res, 'Password reset token generated successfully', {
      resetToken,
      expiresAt: expiry.toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password (Public)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return errorResponse(res, 'Reset token and new password are required', 400);
    }

    const user = await userModel.findUserByResetToken(token);
    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    const hashedPassword = await hash(newPassword);
    await userModel.updateResetToken(user.id, null, null);
    await require('../config/db').query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return successResponse(res, 'Password reset successful. You may now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile (Private)
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile (Private)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await userModel.findUserById(req.user.id);

    let updatedName = name || user.name;
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to update password', 400);
      }
      const fullUser = await userModel.findUserByEmail(user.email);
      const isMatch = await compare(currentPassword, fullUser.password);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect current password', 401);
      }
      const hashedPassword = await hash(newPassword);
      await require('../config/db').query(`UPDATE users SET name = ?, password = ? WHERE id = ?`, [updatedName, hashedPassword, user.id]);
    } else {
      await require('../config/db').query(`UPDATE users SET name = ? WHERE id = ?`, [updatedName, user.id]);
    }

    return successResponse(res, 'Profile updated successfully', {
      id: user.id,
      name: updatedName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile
};
