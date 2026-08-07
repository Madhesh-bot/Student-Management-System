const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validator');

router.post('/register', validateRegister, registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
