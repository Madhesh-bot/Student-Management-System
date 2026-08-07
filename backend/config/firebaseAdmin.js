const admin = require('firebase-admin');
require('dotenv').config();

// Safely initialize Firebase Admin SDK
let firebaseAdmin = null;

try {
  const apps = admin.apps || [];
  if (apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'student-management-system';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (clientEmail && privateKey) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('🔥 Firebase Admin SDK initialized with Service Account Credentials.');
    } else {
      firebaseAdmin = admin.initializeApp({
        projectId
      });
      console.log(`🔥 Firebase Admin SDK initialized with Project ID: ${projectId}`);
    }
  } else {
    firebaseAdmin = admin.app();
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin Initialization Warning:', error.message);
}


module.exports = admin;
