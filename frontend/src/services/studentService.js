import api from './api';

/**
 * Fetch all students
 */
const getAllStudents = async (page, limit) => {
  const url = page ? `/students?page=${page}&limit=${limit || 10}` : '/students';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch current student profile
 */
const getStudentMe = async () => {
  const response = await api.get('/students/me');
  return response.data;
};

/**
 * Fetch student by ID
 */
const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

/**
 * Add a new student record
 */
const addStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

/**
 * Update an existing student record
 */
const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

/**
 * Delete a student record
 */
const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

/**
 * Search students matching a query keyword
 */
const searchStudents = async (keyword) => {
  const response = await api.get(`/students/search?q=${encodeURIComponent(keyword)}`);
  return response.data;
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
