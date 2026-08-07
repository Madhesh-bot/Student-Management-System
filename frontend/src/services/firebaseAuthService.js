import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import api from './api';

/**
 * Format Firebase Auth Error codes into user-friendly messages
 */
const formatFirebaseError = (error) => {
  if (!error) return 'Authentication failed. Please try again.';
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  const code = error.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled in your Firebase Console. Please enable Email/Password under Firebase Console -> Authentication -> Sign-in method.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists in Firebase.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      if (error.message && !error.message.includes('status code')) {
        return error.message;
      }
      return 'Invalid email or password. Please try again.';
  }
};

export const firebaseAuthService = {
  /**
   * Hybrid Sign-In: Firebase Auth Verification + MySQL Profile Retrieval
   * Supports email address, register number, and Firebase UID authentication.
   */
  login: async (rawEmail, rawPassword) => {
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const password = rawPassword ? rawPassword.trim() : '';

    if (!email || !password) {
      throw new Error('Please enter both email/register number and password');
    }

    try {
      let mysqlUserData = null;
      let jwtToken = null;
      let backendError = null;

      // 1. Authenticate against REST backend FIRST to fetch real database user profile
      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data && response.data.success) {
          const { token, ...userData } = response.data.data;
          mysqlUserData = userData;
          jwtToken = token;
        }
      } catch (err) {
        backendError = err;
      }

      // If MySQL backend authenticated successfully, save & return real database user profile
      if (mysqlUserData && jwtToken) {
        const idToken = jwtToken;
        const userSession = {
          ...mysqlUserData,
          id: mysqlUserData.id,
          uid: mysqlUserData.firebase_uid || mysqlUserData.id,
          firebase_uid: mysqlUserData.firebase_uid || mysqlUserData.id,
          name: mysqlUserData.name,
          email: mysqlUserData.email,
          role: mysqlUserData.role || (email.includes('admin') ? 'admin' : 'student'),
          token: idToken
        };

        localStorage.setItem('sms_token', idToken);
        localStorage.setItem('sms_user', JSON.stringify(userSession));
        localStorage.setItem('firebase_user', JSON.stringify(userSession));

        return { success: true, user: userSession };
      }

      // 2. Firebase Auth Fallback for student/staff users
      if (email && email.includes('@')) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCred.user;
          const token = await getIdToken(fbUser, true).catch(() => 'FB_FALLBACK_TOKEN');

          const userSession = {
            id: fbUser.uid,
            uid: fbUser.uid,
            firebase_uid: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: email,
            role: email.includes('admin') ? 'admin' : 'student',
            token: token
          };

          localStorage.setItem('sms_token', token);
          localStorage.setItem('sms_user', JSON.stringify(userSession));
          localStorage.setItem('firebase_user', JSON.stringify(userSession));

          return { success: true, user: userSession };
        } catch (fbErr) {
          console.warn('ℹ️ Firebase Auth verification notice:', fbErr.message);
        }
      }

      // If backend failed with specific error (e.g. 401 Invalid credentials), throw user-friendly error
      if (backendError) {
        const status = backendError.response?.status;
        const msg = backendError.response?.data?.message;
        if (status === 401 || status === 404) {
          throw new Error('Invalid email or password');
        }
        if (msg) {
          throw new Error(msg);
        }
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('🔥 Login Error:', error);
      const friendlyMessage = formatFirebaseError(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Hybrid Registration: Firebase Auth Creation -> MySQL Insertion -> Firestore Backup
   */
  register: async (name, email, password, role = 'student', extraFields = {}) => {
    // Support object options or positional parameters cleanly
    let regName = typeof name === 'object' ? name.name : name;
    let regEmail = typeof name === 'object' ? name.email : email;
    let regPassword = typeof name === 'object' ? name.password : password;
    let regRole = typeof name === 'object' ? name.role || role : role;
    let regExtra = typeof name === 'object' ? name : extraFields;

    const cleanEmail = regEmail ? regEmail.trim().toLowerCase() : '';
    const cleanPassword = regPassword ? regPassword.trim() : '';
    const cleanName = regName ? regName.trim() : cleanEmail.split('@')[0];

    let userCredential = null;
    let firebaseUser = null;
    let firebaseUid = null;

    try {
      // 1. Attempt Firebase Auth registration with a 3s timeout race to prevent mobile hanging
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase registration timeout')), 3000)
        );
        userCredential = await Promise.race([
          createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword),
          timeoutPromise
        ]);
        firebaseUser = userCredential.user;
        firebaseUid = firebaseUser.uid;
      } catch (fbErr) {
        console.warn('ℹ️ Firebase Auth registration notice (proceeding with MySQL):', fbErr.message);
        firebaseUid = `uid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      }

      let mysqlUserData = null;
      let jwtToken = null;

      // 2. Save user profile into MySQL Database with firebase_uid
      try {
        const response = await api.post('/auth/register', {
          firebase_uid: firebaseUid,
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: regRole,
          ...regExtra
        });

        if (response.data && response.data.success) {
          const { token, ...userData } = response.data.data;
          mysqlUserData = userData;
          jwtToken = token;
        }
      } catch (backendErr) {
        if (firebaseUser) {
          console.error('❌ MySQL Registration Failed. Rolling back Firebase User creation...', backendErr.response?.data?.message || backendErr.message);
          try {
            await deleteUser(firebaseUser);
            console.log('🔄 Firebase User Creation Rolled Back Successfully');
          } catch (rollbackErr) {
            console.error('⚠️ Rollback Warning:', rollbackErr.message);
          }
        }
        const errMsg = backendErr.response?.data?.message || backendErr.message || 'MySQL database user registration failed';
        throw new Error(errMsg);
      }

      // 3. Store user metadata in Firestore 'users' collection (non-blocking)
      const userProfile = {
        uid: firebaseUid,
        firebase_uid: firebaseUid,
        email: cleanEmail,
        name: cleanName,
        role: regRole.toLowerCase(),
        register_number: regExtra.register_number || '',
        department: regExtra.department || '',
        year: regExtra.year || '',
        section: regExtra.section || '',
        gender: regExtra.gender || '',
        phone: regExtra.phone || '',
        address: regExtra.address || '',
        createdAt: serverTimestamp()
      };

      setDoc(doc(db, 'users', firebaseUid), userProfile).catch(err => {
        console.warn('ℹ️ Firestore backup doc creation notice:', err.message);
      });

      if (regRole.toLowerCase() === 'student') {
        setDoc(doc(db, 'students', firebaseUid), {
          uid: firebaseUid,
          firebase_uid: firebaseUid,
          name: cleanName,
          email: cleanEmail,
          register_number: regExtra.register_number || '',
          department: regExtra.department || '',
          year: regExtra.year || '1',
          section: regExtra.section || 'A',
          gender: regExtra.gender || 'Male',
          phone: regExtra.phone || '',
          address: regExtra.address || '',
          createdAt: serverTimestamp()
        }).catch(err => {
          console.warn('ℹ️ Firestore student doc creation notice:', err.message);
        });
      }

      const idToken = jwtToken || (firebaseUser ? await getIdToken(firebaseUser, true) : 'MOCK_TOKEN');
      const userSession = {
        ...mysqlUserData,
        uid: firebaseUid,
        firebase_uid: firebaseUid,
        email: cleanEmail,
        name: cleanName,
        role: regRole.toLowerCase(),
        token: idToken
      };

      // Persist session locally
      localStorage.setItem('sms_token', idToken);
      localStorage.setItem('sms_user', JSON.stringify(userSession));
      localStorage.setItem('firebase_user', JSON.stringify(userSession));

      return { success: true, user: userSession };
    } catch (error) {
      console.error('🔥 Hybrid Registration Error:', error);
      const friendlyMessage = formatFirebaseError(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Firebase Sign Out
   */
  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      localStorage.removeItem('firebase_user');
      return { success: true };
    } catch (error) {
      console.error('🔥 Logout Error:', error);
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      localStorage.removeItem('firebase_user');
      return { success: false, message: error.message };
    }
  },

  /**
   * Get Current Session
   */
  getCurrentUser: () => {
    const saved = localStorage.getItem('sms_user') || localStorage.getItem('firebase_user');
    return saved ? JSON.parse(saved) : null;
  }
};

export default firebaseAuthService;


