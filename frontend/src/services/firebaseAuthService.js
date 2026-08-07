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
  login: async (email, password) => {
    try {
      let firebaseUser = null;
      let firebaseUid = null;

      // 1. Attempt Firebase Auth if identifier is an email address
      if (email && email.includes('@')) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = userCredential.user;
          firebaseUid = firebaseUser.uid;
        } catch (fbAuthErr) {
          console.warn('ℹ️ Firebase Auth sign-in notice:', fbAuthErr.message);
        }
      }

      // 2. Load profile and JWT token from MySQL backend
      let mysqlUserData = null;
      let jwtToken = null;
      let backendError = null;

      try {
        const response = await api.post('/auth/login', {
          email,
          password,
          firebase_uid: firebaseUid
        });

        if (response.data && response.data.success) {
          const { token, ...userData } = response.data.data;
          mysqlUserData = userData;
          jwtToken = token;
        }
      } catch (err) {
        backendError = err;
      }

      // If MySQL failed and no Firebase user was authenticated, throw clean error
      if (!mysqlUserData && !firebaseUser) {
        if (backendError) throw backendError;
        throw new Error('Invalid email or password');
      }

      // 3. Fall back to Firestore profile if MySQL user profile wasn't returned
      if (!mysqlUserData && firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUid);
          const userDocSnap = await getDoc(userDocRef);

          const profileData = userDocSnap.exists()
            ? userDocSnap.data()
            : { 
                uid: firebaseUid,
                role: 'student', 
                email: firebaseUser.email, 
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0] 
              };

          mysqlUserData = {
            id: firebaseUid,
            firebase_uid: firebaseUid,
            email: firebaseUser.email,
            name: profileData.name || firebaseUser.email.split('@')[0],
            role: profileData.role || 'student',
            register_number: profileData.register_number || '',
            department: profileData.department || '',
            year: profileData.year || '',
            section: profileData.section || '',
            phone: profileData.phone || '',
            address: profileData.address || ''
          };
        } catch (fsErr) {
          mysqlUserData = {
            id: firebaseUid,
            firebase_uid: firebaseUid,
            email: firebaseUser.email,
            name: firebaseUser.email.split('@')[0],
            role: 'student'
          };
        }
      }

      const idToken = jwtToken || (firebaseUser ? await getIdToken(firebaseUser, true) : 'MOCK_TOKEN');
      const userSession = {
        ...mysqlUserData,
        uid: firebaseUid || mysqlUserData.firebase_uid || mysqlUserData.id,
        firebase_uid: firebaseUid || mysqlUserData.firebase_uid || mysqlUserData.id,
        token: idToken
      };

      // Persist session to localStorage for app-wide compatibility
      localStorage.setItem('sms_token', idToken);
      localStorage.setItem('sms_user', JSON.stringify(userSession));
      localStorage.setItem('firebase_user', JSON.stringify(userSession));

      return { success: true, user: userSession };
    } catch (error) {
      console.error('🔥 Firebase / MySQL Login Error:', error);
      const friendlyMessage = formatFirebaseError(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Hybrid Registration: Firebase Auth Creation -> MySQL Insertion -> Firestore Backup
   * Supports parameter order auto-detection (email, password, name OR name, email, password).
   */
  register: async (arg1, arg2, arg3, role = 'student', extraFields = {}) => {
    let email, password, name;

    // Auto-detect argument order
    if (typeof arg1 === 'string' && arg1.includes('@')) {
      email = arg1.trim();
      password = arg2;
      name = arg3 || email.split('@')[0];
    } else if (typeof arg2 === 'string' && arg2.includes('@')) {
      name = arg1;
      email = arg2.trim();
      password = arg3;
    } else {
      name = arg1;
      email = arg2;
      password = arg3;
    }

    let userCredential = null;
    try {
      // 1. Create User in Firebase Authentication first
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const firebaseUid = firebaseUser.uid;

      let mysqlUserData = null;
      let jwtToken = null;

      // 2. Save user profile into MySQL Database with firebase_uid
      try {
        const response = await api.post('/auth/register', {
          firebase_uid: firebaseUid,
          name,
          email,
          password,
          role,
          ...extraFields
        });

        if (response.data && response.data.success) {
          const { token, ...userData } = response.data.data;
          mysqlUserData = userData;
          jwtToken = token;
        }
      } catch (backendErr) {
        console.error('❌ MySQL Registration Failed. Rolling back Firebase User creation...', backendErr.response?.data?.message || backendErr.message);
        // ROLLBACK: Delete the Firebase user created in step 1 if MySQL insertion fails
        try {
          await deleteUser(firebaseUser);
          console.log('🔄 Firebase User Creation Rolled Back Successfully');
        } catch (rollbackErr) {
          console.error('⚠️ Rollback Warning:', rollbackErr.message);
        }
        throw new Error(backendErr.response?.data?.message || backendErr.message || 'MySQL database user registration failed');
      }

      // 3. Store user metadata in Firestore 'users' collection with firebase_uid
      const userProfile = {
        uid: firebaseUid,
        firebase_uid: firebaseUid,
        email: email.toLowerCase(),
        name,
        role: role.toLowerCase(),
        register_number: extraFields.register_number || '',
        department: extraFields.department || '',
        year: extraFields.year || '',
        section: extraFields.section || '',
        gender: extraFields.gender || '',
        phone: extraFields.phone || '',
        address: extraFields.address || '',
        createdAt: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'users', firebaseUid), userProfile);
        if (role.toLowerCase() === 'student') {
          await setDoc(doc(db, 'students', firebaseUid), {
            uid: firebaseUid,
            firebase_uid: firebaseUid,
            name,
            email: email.toLowerCase(),
            register_number: extraFields.register_number || '',
            department: extraFields.department || '',
            year: extraFields.year || '1',
            section: extraFields.section || 'A',
            gender: extraFields.gender || 'Male',
            phone: extraFields.phone || '',
            address: extraFields.address || '',
            createdAt: serverTimestamp()
          });
        }
      } catch (firestoreErr) {
        console.warn('ℹ️ Firestore backup doc creation notice:', firestoreErr.message);
      }

      const idToken = jwtToken || (await getIdToken(firebaseUser, true));
      const userSession = {
        ...mysqlUserData,
        uid: firebaseUid,
        firebase_uid: firebaseUid,
        email: email.toLowerCase(),
        name,
        role: role.toLowerCase(),
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


