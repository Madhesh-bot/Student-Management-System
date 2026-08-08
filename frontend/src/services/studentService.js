import api from './api';
import firestoreService from './firestoreService';

const INITIAL_STUDENTS = [
  {
    id: 1,
    register_number: 'REG1001',
    student_name: 'Alice Smith',
    department: 'Computer Science and Engineering',
    dept_code: 'CSE',
    year: '4th Year',
    section: 'A',
    gender: 'Female',
    email: 'alice.smith@university.edu',
    phone: '9876543210',
    address: '123 Campus Way'
  },
  {
    id: 2,
    register_number: 'REG1002',
    student_name: 'Madhesh K',
    department: 'Information Technology',
    dept_code: 'IT',
    year: '4th Year',
    section: 'A',
    gender: 'Male',
    email: 'mathesh21122005@gmail.com',
    phone: '9876543211',
    address: '45 Innovation Rd'
  },
  {
    id: 3,
    register_number: 'REG1003',
    student_name: 'Bob Johnson',
    department: 'Electronics and Communication',
    dept_code: 'ECE',
    year: '3rd Year',
    section: 'B',
    gender: 'Male',
    email: 'bob.johnson@university.edu',
    phone: '9876543212',
    address: '78 Tech Lane'
  },
  {
    id: 4,
    register_number: 'REG1004',
    student_name: 'Carol Williams',
    department: 'Computer Science and Engineering',
    dept_code: 'CSE',
    year: '2nd Year',
    section: 'A',
    gender: 'Female',
    email: 'carol.williams@university.edu',
    phone: '9876543213',
    address: '90 Science Blvd'
  }
];

export const normalizeStudent = (s) => {
  if (!s) return null;
  return {
    ...s,
    id: s.id || s.student_id || Date.now(),
    register_number: s.register_number || s.reg_no || s.regNo || '',
    student_name: s.student_name || s.name || s.full_name || 'Unknown Student',
    department: s.department || s.dept_name || s.dept || 'General',
    dept_code: s.dept_code || s.code || (s.department ? s.department.substring(0, 4).toUpperCase() : 'GEN'),
    year: s.year ? (String(s.year).includes('Year') ? String(s.year) : `${s.year} Year`) : '1st Year',
    section: s.section || 'A',
    gender: s.gender || 'Male',
    email: s.email || '',
    phone: s.phone || '',
    address: s.address || ''
  };
};

const getStoredStudents = () => {
  const saved = localStorage.getItem('sms_students');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeStudent);
      }
    } catch (e) {}
  }
  const initialized = INITIAL_STUDENTS.map(normalizeStudent);
  localStorage.setItem('sms_students', JSON.stringify(initialized));
  return initialized;
};

const setStoredStudents = (list) => {
  const normalized = Array.isArray(list) ? list.map(normalizeStudent) : [];
  localStorage.setItem('sms_students', JSON.stringify(normalized));
};

/**
 * Fetch all students with hybrid fallback
 */
const getAllStudents = async (page = 1, limit = 50) => {
  // 1. Try REST API
  try {
    const url = page ? `/students?page=${page}&limit=${limit || 50}` : '/students';
    const response = await api.get(url);
    if (response.data) {
      const list = Array.isArray(response.data) ? response.data : (response.data.students || response.data.data);
      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map(normalizeStudent);
        setStoredStudents(normalized);
        const meta = response.data.meta || response.data.pagination || { total: normalized.length, page: Number(page), totalPages: 1 };
        return {
          success: true,
          data: normalized,
          students: normalized,
          pagination: meta
        };
      }
    }
  } catch (err) {
    console.warn('ℹ️ REST API backend student fetch notice (using hybrid store):', err.message);
  }

  // 2. Try Firestore fallback
  try {
    const fsStudents = await firestoreService.getStudents();
    if (Array.isArray(fsStudents) && fsStudents.length > 0) {
      const normalized = fsStudents.map(normalizeStudent);
      setStoredStudents(normalized);
      return {
        success: true,
        data: normalized,
        students: normalized,
        pagination: { total: normalized.length, page: 1, totalPages: 1 }
      };
    }
  } catch (fsErr) {
    console.warn('ℹ️ Firestore student fetch notice:', fsErr.message);
  }

  // 3. Local database store fallback
  const localList = getStoredStudents();
  return {
    success: true,
    data: localList,
    students: localList,
    pagination: { total: localList.length, page: 1, totalPages: 1 }
  };
};

/**
 * Fetch current student profile
 */
const getStudentMe = async () => {
  try {
    const response = await api.get('/students/me');
    if (response.data) {
      const s = response.data.data?.student || response.data.student || response.data.data;
      if (s) {
        return { success: true, data: { student: normalizeStudent(s) } };
      }
    }
  } catch (err) {}

  const currentUser = JSON.parse(localStorage.getItem('sms_user') || '{}');
  const students = getStoredStudents();
  const match = students.find(s => 
    s.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
    s.user_id === currentUser.id
  );
  return { success: true, data: { student: normalizeStudent(match || students[0]) } };
};

/**
 * Fetch student by ID
 */
const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    if (response.data) return response.data;
  } catch (err) {}

  const students = getStoredStudents();
  const match = students.find(s => String(s.id) === String(id));
  return { success: true, data: match || students[0] };
};

/**
 * Add a new student record
 */
const addStudent = async (studentData) => {
  const newId = Date.now();
  const newStudent = {
    id: newId,
    ...studentData,
    created_at: new Date().toISOString()
  };

  // 1. Save to local storage
  const currentList = getStoredStudents();
  const updatedList = [newStudent, ...currentList];
  setStoredStudents(updatedList);

  // 2. Sync to Cloud Firestore
  firestoreService.addStudent(newStudent).catch(err => {
    console.warn('ℹ️ Firestore student add notice:', err.message);
  });

  // 3. Attempt REST API insertion
  try {
    const response = await api.post('/students', studentData);
    if (response.data && response.data.data) {
      return response.data;
    }
  } catch (err) {
    console.warn('ℹ️ REST API backend student add notice (saved locally & Firestore):', err.message);
  }

  return { success: true, data: newStudent };
};

/**
 * Update an existing student record
 */
const updateStudent = async (id, studentData) => {
  const currentList = getStoredStudents();
  const updatedList = currentList.map(s => String(s.id) === String(id) ? { ...s, ...studentData } : s);
  setStoredStudents(updatedList);

  firestoreService.updateStudent(String(id), studentData).catch(err => {
    console.warn('ℹ️ Firestore student update notice:', err.message);
  });

  try {
    const response = await api.put(`/students/${id}`, studentData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn('ℹ️ REST API backend student update notice (updated locally):', err.message);
  }

  const updatedItem = updatedList.find(s => String(s.id) === String(id));
  return { success: true, data: updatedItem };
};

/**
 * Delete a student record
 */
const deleteStudent = async (id) => {
  const currentList = getStoredStudents();
  const updatedList = currentList.filter(s => String(s.id) !== String(id));
  setStoredStudents(updatedList);

  firestoreService.deleteStudent(String(id)).catch(err => {
    console.warn('ℹ️ Firestore student delete notice:', err.message);
  });

  try {
    const response = await api.delete(`/students/${id}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn('ℹ️ REST API backend student delete notice (deleted locally):', err.message);
  }

  return { success: true };
};

/**
 * Search students matching a query keyword
 */
const searchStudents = async (keyword) => {
  try {
    const response = await api.get(`/students/search?q=${encodeURIComponent(keyword)}`);
    if (response.data) return response.data;
  } catch (err) {}

  const term = (keyword || '').toLowerCase();
  const students = getStoredStudents();
  const filtered = students.filter(s =>
    (s.student_name || '').toLowerCase().includes(term) ||
    (s.register_number || '').toLowerCase().includes(term) ||
    (s.email || '').toLowerCase().includes(term) ||
    (s.department || '').toLowerCase().includes(term)
  );

  return { success: true, data: filtered };
};

export default {
  getAllStudents,
  getStudentMe,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  searchStudents
};
