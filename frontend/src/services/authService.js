import firebaseAuthService from './firebaseAuthService';
import api from './api';

/**
 * Log in using Firebase Authentication with Firestore profile retrieval
 */
const login = async (email, password) => {
  try {
    const result = await firebaseAuthService.login(email, password);
    return result.user;
  } catch (error) {
    // If backend REST fallback is available and Firebase throws, attempt fallback
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('sms_token', token);
        localStorage.setItem('sms_user', JSON.stringify(userData));
        return userData;
      }
    } catch (apiErr) {
      // Re-throw original Firebase friendly error message
      throw error;
    }
    throw error;
  }
};

/**
 * Register a new user in Firebase Auth & Firestore
 */
const register = async (name, email, password, role, extraFields = {}) => {
  try {
    const result = await firebaseAuthService.register(name, email, password, role, extraFields);
    return result.user;
  } catch (error) {
    try {
      const response = await api.post('/auth/register', { name, email, password, role, ...extraFields });
      if (response.data && response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('sms_token', token);
        localStorage.setItem('sms_user', JSON.stringify(userData));
        return userData;
      }
    } catch (apiErr) {
      throw error;
    }
    throw error;
  }
};

/**
 * Log out of the application using Firebase Authentication
 */
const logout = async () => {
  await firebaseAuthService.logout();
};

/**
 * Retrieve current logged in user details from local store cache
 */
const getCurrentUser = () => {
  return firebaseAuthService.getCurrentUser();
};

/**
 * Fetch profile details from backend / Firebase session
 */
const getProfile = async () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    return { success: true, data: currentUser };
  }
  const response = await api.get('/auth/profile');
  return response.data;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getProfile
};

