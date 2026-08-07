import { storage, db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB Limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const firebaseStorageService = {
  /**
   * Validate file size and type
   */
  validateFile: (file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds maximum 5MB limit' };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Allowed formats: JPEG, PNG, WEBP, PDF' };
    }
    return { valid: true };
  },

  /**
   * Upload Profile Photo to Firebase Storage
   */
  uploadProfilePhoto: async (userId, file) => {
    const validation = firebaseStorageService.validateFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const storageRef = ref(storage, `profiles/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  },

  /**
   * Upload Document to Firebase Storage
   */
  uploadDocument: async (pathFolder, file) => {
    const validation = firebaseStorageService.validateFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const storageRef = ref(storage, `${pathFolder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      downloadURL
    };
  }
};

export default firebaseStorageService;
