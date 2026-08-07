import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Universal Firestore Data Access Service
 * Synchronizes Student, Staff, Attendance, Marks, Departments, Courses, and Reports to Firestore.
 */
export const firestoreService = {
  // --- STUDENTS ---
  getStudents: async () => {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addStudent: async (studentData) => {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...studentData };
  },

  updateStudent: async (id, studentData) => {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, {
      ...studentData,
      updatedAt: serverTimestamp()
    });
    return { id, ...studentData };
  },

  deleteStudent: async (id) => {
    const studentRef = doc(db, 'students', id);
    await deleteDoc(studentRef);
    return true;
  },

  // --- ATTENDANCE ---
  getAttendance: async () => {
    const querySnapshot = await getDocs(collection(db, 'attendance'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  logAttendance: async (attendanceData) => {
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...attendanceData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...attendanceData };
  },

  // --- MARKS ---
  getMarks: async () => {
    const querySnapshot = await getDocs(collection(db, 'marks'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  saveMarks: async (marksData) => {
    const docRef = await addDoc(collection(db, 'marks'), {
      ...marksData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...marksData };
  },

  // --- REPORTS ---
  getReports: async () => {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // --- DEPARTMENTS & COURSES ---
  getDepartments: async () => {
    const querySnapshot = await getDocs(collection(db, 'departments'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getCourses: async () => {
    const querySnapshot = await getDocs(collection(db, 'courses'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export default firestoreService;
